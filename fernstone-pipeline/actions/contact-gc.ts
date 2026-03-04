'use server'

import { createClient } from '@supabase/supabase-js'

export async function messageGC(senderProfileId: string, gcId: string, projectId: string | null, subject: string, message: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const insertData: any = {
            sender_id: senderProfileId,
            receiver_id: gcId,
            subject: subject,
            body: message
        }

        if (projectId) {
            insertData.project_id = projectId;
        }

        const { error: msgError } = await supabase
            .from('messages')
            .insert(insertData)

        if (msgError) {
            console.error("Failed to insert message to GC:", msgError)
            return { error: msgError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Send message try/catch warning:', error.message)
        return { error: 'Failed to send message' }
    }
}
