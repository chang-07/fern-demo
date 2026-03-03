"use server"

import { createClient } from "@/utils/supabase/server"
import { resend } from "@/lib/resend"

export async function contactSubcontractor(subcontractorId: string, email: string, gcMessage: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Not authenticated" }
    }

    try {
        await resend.emails.send({
            from: 'Fernstone <onboarding@resend.dev>',
            to: [email],
            subject: `Message from General Contractor`,
            html: `
                <p>Hello,</p>
                <p>A General Contractor has sent you a message regarding your services:</p>
                <blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
                    ${gcMessage}
                </blockquote>
                <p>Please log in to your Fernstone profile to respond or follow up.</p>
                <br/>
                <p>Thank you,<br/>The Fernstone Team</p>
            `
        })

        return { success: true }
    } catch (error: any) {
        console.error("Contact Subcontractor Error:", error)
        return { error: error.message || "Failed to send message." }
    }
}
