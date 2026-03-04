"use server"

import { createClient } from "@/utils/supabase/server"
export async function messageSubcontractor(subcontractorId: string, email: string, gcMessage: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    try {
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (profile) {
            const { error: msgError } = await (supabase as any)
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: profile.id,
                    subject: `Message from General Contractor`,
                    body: gcMessage
                })

            if (msgError) {
                console.error("Failed to insert message to sub:", msgError)
            }
        } else {
            console.warn("Could not find profile for email to send message:", email)
        }

        return { success: true }
    } catch (error: any) {
        console.error("Contact Subcontractor Error:", error)
        return { error: error.message || "Failed to send message." }
    }
}
