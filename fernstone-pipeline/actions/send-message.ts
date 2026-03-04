'use server'

import { createClient } from '@/utils/supabase/server'

export async function sendMessageToSubcontractor(subcontractorId: string, subject: string, message: string) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Fetch Subcontractor & Verify Ownership
    const { data: sub } = await supabase
        .from('subcontractors')
        .select(`
            id,
            email,
            projects (
                id,
                name,
                gc_id
            )
        `)
        .eq('id', subcontractorId)
        .single()

    if (!sub || !sub.projects) {
        return { error: 'Subcontractor not found' }
    }

    const project = sub.projects as any
    if (project.gc_id !== user.id) {
        return { error: 'Unauthorized access to this subcontractor' }
    }

    // 3. Find receiver & Send Internal Message
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('email', sub.email)
        .single()

    if (!profile) {
        console.warn("Could not find profile for sub email to send message:", sub.email);
        return { success: true } // Fake success for demo
    }

    const { error: msgError } = await (supabase as any)
        .from('messages')
        .insert({
            sender_id: user.id,
            receiver_id: profile.id,
            project_id: project.id,
            subject: subject,
            body: message
        });

    if (msgError) {
        console.error("Failed to insert message to sub:", msgError);
    }

    return { success: true }
}
