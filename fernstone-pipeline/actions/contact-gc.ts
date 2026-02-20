'use server'

import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

export async function contactGC(subcontractorId: string, subject: string, message: string) {
    // Subcontractors don't have a user session, so we use the Service Role key
    // to look up the project and GC details securely.
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch Subcontractor & GC Email
    const { data: sub } = await supabase
        .from('subcontractors')
        .select(`
            id,
            email,
            projects (
                id,
                name,
                user_id:gc_id
            )
        `)
        .eq('id', subcontractorId)
        .single()

    if (!sub || !sub.projects) {
        return { error: 'Subcontractor not found' }
    }

    const project = sub.projects as any
    // Fetch GC email
    // "users" table is in auth schema, usually not accessible directly via public client.
    // But with service role we can use auth.admin.getUserById()

    const { data: { user: gcUser }, error: userError } = await supabase.auth.admin.getUserById(project.user_id)

    if (userError || !gcUser || !gcUser.email) {
        return { error: 'Could not contact GC' }
    }

    // Send Email
    try {
        await resend.emails.send({
            from: 'Fernstone <updates@resend.dev>', // Use resend.dev for testing
            to: [gcUser.email],
            subject: `Subcontractor Question: ${project.name} - ${subject}`,
            html: `
                <p><strong>Project:</strong> ${project.name}</p>
                <p><strong>From:</strong> ${sub.email}</p>
                <p><strong>Message:</strong></p>
                <div style="padding: 12px; border-left: 4px solid #ccc; background-color: #f9f9f9;">
                    ${message.replace(/\n/g, '<br/>')}
                </div>
                <br/>
                <p><small>You can reply directly to this email to contact the subcontractor.</small></p> 
            `,
            replyTo: sub.email
        })
        return { success: true }
    } catch (error: any) {
        console.error('Send email error:', error)
        return { error: error.message || 'Failed to send email' }
    }
}
