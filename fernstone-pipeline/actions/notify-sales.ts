'use server'

import { createClient } from '@/utils/supabase/server'
import { resend } from '@/utils/resend'

export async function notifySales(subcontractorId: string) {
    const supabase = await createClient()

    // Fetch details
    const { data: sub } = await supabase
        .from('subcontractors')
        .select(`
        *,
        projects (name),
        compliance_reports (extracted_gl_limit, has_additional_insured)
    `)
        .eq('id', subcontractorId)
        .single()

    if (!sub) return { error: 'Subcontractor not found' }

    const project = sub.projects
    const report = sub.compliance_reports?.[0]

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
        await resend.emails.send({
            from: 'Fernstone System <alerts@resend.dev>',
            to: ['sales@fernstone.com'], // In prod, this would be the sales team alias
            subject: `Upsell Alert: ${sub.email} - ${project?.name}`,
            html
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to notify sales:', error)
        return { error: 'Failed to notify sales team' }
    }
}
