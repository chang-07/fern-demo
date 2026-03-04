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

    console.log(`[APPROVE ACTION] Starting approval for sub: ${subcontractorId}`)
    try {
        const { data: subData, error: fetchError } = await supabase
            .from("subcontractors")
            .select("project_id, email, projects (gc_id, name)")
            .eq("id", subcontractorId)
            .single()

        console.log(`[APPROVE ACTION] Fetch result: error=`, fetchError, `data=`, subData)

        if (fetchError || !subData || (subData.projects as any).gc_id !== user.id) {
            console.log(`[APPROVE ACTION] Unauthorized or missing. GC ID check:`, (subData?.projects as any)?.gc_id, `User ID:`, user.id)
            return { error: "Unauthorized to approve this subcontractor." }
        }

        // Update Subcontractor status
        const { error: updateError } = await supabase
            .from("subcontractors")
            .update({ status: 'APPROVED' })
            .eq("id", subcontractorId)

        if (updateError) throw updateError

        // Always close the project for the demo flow when a sub is approved
        const { error: projectError } = await supabase
            .from("projects")
            .update({ status: 'CLOSED' })
            .eq("id", subData.project_id)

        if (projectError) throw projectError

        const isProjectComplete = true; // Hardcoded to true for demo flow

        // Send Approval Email
        const projectName = (subData.projects as any).name || "the project";
        try {
            const { error: resendError } = await resend.emails.send({
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

            if (resendError) {
                console.warn('Resend demo warning in approve:', resendError.message)
            }
        } catch (emailError: any) {
            console.warn("Approve Subcontractor Warning (Demo fallback):", emailError.message)
        }

        // Revalidate the dashboard and project specific page
        revalidatePath("/dashboard")
        revalidatePath(`/dashboard/projects/${subData.project_id}`)

        return {
            success: true,
            projectClosed: isProjectComplete,
            projectName: isProjectComplete ? projectName : undefined
        }
    } catch (error: any) {
        console.error("Approve Subcontractor DB Error:", error)
        return { error: error.message || "Failed to approve subcontractor." }
    }
}
