'use server'

import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'

export async function notifySales(subcontractorId: string) {
    const supabase = await createClient()

    // Fetch details
    const { data: sub } = await supabase
        .from('subcontractors')
        .select(`
        *,
        projects (name, gc_id),
        compliance_reports (extracted_gl_limit, has_additional_insured)
    `)
        .eq('id', subcontractorId)
        .single()

    if (!sub) return { error: 'Subcontractor not found' }

    const project = sub.projects as any
    const report = sub.compliance_reports?.[0]

    // Fetch GC user to bypass Resend free tier sending constraints
    const { data: { user: gcUser }, error: userError } = await supabase.auth.admin.getUserById(project.gc_id)

    if (userError || !gcUser || !gcUser.email) {
        return { error: 'Could not contact GC to generate Upsell' }
    }

    // Construct email content
    const html = `
    <h1>New Upsell Opportunity</h1>
    <p><strong>Project:</strong> ${project?.name}</p>
    <p><strong>Subcontractor:</strong> ${sub.email}</p>
    <p><strong>Gap Details:</strong></p>
    <ul>
        <li>Current Limit: $${(report?.extracted_gl_limit || 0) / 1000000}M</li>
        <li>Additional Insured: ${report?.has_additional_insured ? 'Yes' : 'No'}</li>
    </ul>
    <p>Action: Contact immediately to bridge the coverage gap.</p>
  `

    try {
        const { data, error } = await resend.emails.send({
            from: 'Fernstone System <alerts@resend.dev>',
            // In dev mode with Resend free tier, 'to' must be the verified email (the GC's email)
            to: [gcUser.email || 'sales@fernstone.com'],
            subject: `Upsell Alert: ${sub.email} - ${project?.name}`,
            html
        })

        if (error) {
            console.error('Failed to notify sales (Resend Error):', error)
            return { error: `Email Failed: ${error.message}` }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Failed to notify sales (Catch block):', error)
        return { error: error.message || 'Failed to notify sales team' }
    }
}
