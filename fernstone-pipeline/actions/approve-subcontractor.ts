"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { resend } from "@/lib/resend"

export async function approveSubcontractor(subcontractorId: string) {
    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    try {
        const { data: subData, error: fetchError } = await supabase
            .from("subcontractors")
            .select("project_id, email, projects (gc_id, name)")
            .eq("id", subcontractorId)
            .single()

        if (fetchError || !subData || (subData.projects as any).gc_id !== user.id) {
            return { error: "Unauthorized to approve this subcontractor." }
        }

        // Update Subcontractor status
        const { error: updateError } = await supabase
            .from("subcontractors")
            .update({ status: 'APPROVED' })
            .eq("id", subcontractorId)

        if (updateError) throw updateError

        // Close the Project
        const { error: projectError } = await supabase
            .from("projects")
            .update({ status: 'CLOSED' })
            .eq("id", subData.project_id)

        if (projectError) throw projectError

        // Send Approval Email
        const projectName = (subData.projects as any).name || "the project";
        await resend.emails.send({
            from: 'Fernstone <onboarding@resend.dev>',
            to: [subData.email],
            subject: `Insurance Approved: ${projectName}`,
            html: `
                <h1>Compliance Approved!</h1>
                <p>Great news! Your insurance documents for <strong>${projectName}</strong> have been reviewed and approved.</p>
                <p>You are now cleared to begin work.</p>
                <br/>
                <p>Thank you,<br/>The Fernstone Team</p>
            `
        })

        // Revalidate the dashboard and project specific page
        revalidatePath("/dashboard")
        revalidatePath(`/dashboard/projects/${subData.project_id}`)

        return { success: true }
    } catch (error: any) {
        console.error("Approve Subcontractor Error:", error)
        return { error: error.message || "Failed to approve subcontractor." }
    }
}
