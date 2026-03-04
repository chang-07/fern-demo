'use server'

import { createClient } from '@/utils/supabase/server'

export async function replyToMessage(originalMessageId: string, replyBody: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Fetch original message
    const { data: originalMsg, error: fetchError } = await (supabase as any)
        .from('messages')
        .select('*')
        .eq('id', originalMessageId)
        .single()

    if (fetchError || !originalMsg) {
        return { error: 'Original message not found' }
    }

    // 2. Security Check (ensure user was the receiver or sender of original message)
    if (originalMsg.receiver_id !== user.id && originalMsg.sender_id !== user.id) {
        return { error: 'Unauthorized to reply to this message' }
    }

    // 3. Construct Reply
    const isReceiver = originalMsg.receiver_id === user.id
    const targetReceiverId = isReceiver ? originalMsg.sender_id : originalMsg.receiver_id

    // Prefix subject with "Re: " unless it already has it
    let replySubject = originalMsg.subject
    if (!replySubject.startsWith('Re: ')) {
        replySubject = `Re: ${replySubject}`
    }

    const { error: insertError } = await (supabase as any)
        .from('messages')
        .insert({
            sender_id: user.id,
            receiver_id: targetReceiverId,
            project_id: originalMsg.project_id,
            job_posting_id: originalMsg.job_posting_id,
            subject: replySubject,
            body: replyBody
        })

    if (insertError) {
        console.error("Failed to insert reply:", insertError)
        return { error: insertError.message }
    }

    return { success: true }
}
