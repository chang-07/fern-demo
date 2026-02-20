'use server'

import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'

export async function sendEmailToSubcontractor(subcontractorId: string, subject: string, message: string) {
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

    // 3. Send Email
    try {
        await resend.emails.send({
            from: 'Fernstone <updates@resend.dev>', // Use resend.dev for testing
            to: [sub.email],
            subject: `Message from ${project.name}: ${subject}`,
            html: `
                <p><strong>Project:</strong> ${project.name}</p>
                <p><strong>Message:</strong></p>
                <div style="padding: 12px; border-left: 4px solid #ccc; background-color: #f9f9f9;">
                    ${message.replace(/\n/g, '<br/>')}
                </div>
                <br/>
                <p><small>You can reply directly to this email to contact the General Contractor.</small></p> 
            `,
            reply_to: user.email // Allow sub to reply directly to GC
        })
        return { success: true }
    } catch (error: any) {
        console.error('Send email error:', error)
        return { error: error.message || 'Failed to send email' }
    }
}
