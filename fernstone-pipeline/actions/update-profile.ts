"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    const company_name = formData.get("company_name") as string
    const industry = formData.get("industry") as string
    const description = formData.get("description") as string

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                company_name,
                industry,
                description
            })
            .eq('id', user.id)

        if (error) throw error

        revalidatePath('/subcontractor/profile')
        revalidatePath('/dashboard/market') // Also revalidate market so their changes show up for GCs

        return { success: true }
    } catch (error: any) {
        console.error("Update Profile Error:", error)
        return { error: error.message || "Failed to update profile." }
    }
}
