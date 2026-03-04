"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

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

        // 1. Get the receiver ID from their email
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('email', subData.email)
            .single();

        const projectName = (subData.projects as any).name || "the project";

        if (profile) {
            // Send Approval Message
            const { error: msgError } = await (supabase as any)
                .from('messages')
                .insert({
                    sender_id: user.id, // The GC approving it
                    receiver_id: profile.id, // The Subcontractor
                    project_id: subData.project_id,
                    subject: `Insurance Approved: ${projectName}`,
                    body: `Great news! Your insurance documents for ${projectName} have been reviewed and approved.\n\nYou are now cleared to begin work.\n\nThank you,\nFernstone System`
                });

            if (msgError) {
                console.error("Failed to insert approval message:", msgError);
            }
        } else {
            console.warn("Could not find profile for email to send approval message:", subData.email);
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
