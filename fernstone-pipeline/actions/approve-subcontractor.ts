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

    try {
        // Technically, we should check if the GC owns the project this sub is on,
        // but RLS handles this if we had a proper UPDATE policy. 
        // For simplicity and assuming normal UI flow, we attempt the update.
        // Let's verify ownership just in case the RLS update policy isn't fully robust.

        const { data: subData, error: fetchError } = await supabase
            .from("subcontractors")
            .select("project_id, projects (gc_id)")
            .eq("id", subcontractorId)
            .single()

        if (fetchError || !subData || (subData.projects as any).gc_id !== user.id) {
            return { error: "Unauthorized to approve this subcontractor." }
        }

        const { error: updateError } = await supabase
            .from("subcontractors")
            .update({ status: 'APPROVED' })
            .eq("id", subcontractorId)

        if (updateError) throw updateError

        // Revalidate the dashboard and project specific page
        revalidatePath("/dashboard")
        revalidatePath(`/dashboard/projects/${subData.project_id}`)

        return { success: true }
    } catch (error: any) {
        console.error("Approve Subcontractor Error:", error)
        return { error: error.message || "Failed to approve subcontractor." }
    }
}
