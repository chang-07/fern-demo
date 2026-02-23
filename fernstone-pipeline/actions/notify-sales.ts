'use server'

import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

export async function notifySales(subcontractorId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
    <h1>Fix Your Coverage Gap Instantly</h1>
    <p>Hi there,</p>
    <p>Your recent Certificate of Insurance upload for project <strong>${project?.name}</strong> did not meet the General Contractor's requirements.</p>
    <p><strong>Gap Details:</strong></p>
    <ul>
        <li>Current GL Limit: $${(report?.extracted_gl_limit || 0) / 1000000}M</li>
        <li>Missing Additional Insured Endorsement: ${report?.has_additional_insured ? 'No' : 'Yes'}</li>
    </ul>
    <p>You can instantly bridge this coverage gap and become compliant by onboarding with Fernstone.</p>
    <p><a href="https://fernstone.com/#cta" style="display:inline-block;padding:12px 24px;background-color:#10b981;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Get Coverage Now</a></p>
  `

    try {
        const { data, error } = await resend.emails.send({
            from: 'Fernstone System <alerts@resend.dev>',
            // Depending on testing tier, this might need to be verified. Assuming sub.email is authorized test email.
            to: [sub.email],
            subject: `Action Required: Fix coverage for ${project?.name}`,
            html
        })

        if (error) {
            console.error('Failed to notify Subcontractor (Resend Error):', error)
            return { error: `Email Failed: ${error.message}` }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Failed to notify Subcontractor (Catch block):', error)
        return { error: error.message || 'Failed to send onboarding email' }
    }
}
