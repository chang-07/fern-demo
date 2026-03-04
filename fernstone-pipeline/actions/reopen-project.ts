"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function reopenProject(projectId: string) {
    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    try {
        const { data: project, error: fetchError } = await supabase
            .from("projects")
            .select("gc_id")
            .eq("id", projectId)
            .single()

        if (fetchError || !project || project.gc_id !== user.id) {
            return { error: "Unauthorized to reopen this project." }
        }

        const { error: updateError } = await supabase
            .from("projects")
            .update({ status: 'OPEN' })
            .eq("id", projectId)

        if (updateError) throw updateError

        revalidatePath("/dashboard")
        revalidatePath(`/dashboard/projects/${projectId}`)

        return { success: true }
    } catch (error: any) {
        console.error("Reopen Project Error:", error)
        return { error: error.message || "Failed to reopen project." }
    }
}
