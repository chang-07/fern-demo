'use server'

import { createClient } from '@supabase/supabase-js'
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

    // Find the Subcontractor's profile ID to send the message
    const { data: subProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', sub.email)
        .single()

    if (!subProfile) {
        return { error: 'Could not find Subcontractor profile to send message' }
    }

    // Construct message body
    const body = `Hi there,\n\nYour recent Certificate of Insurance upload for project ${project?.name} did not meet the General Contractor's requirements.\n\nGap Details:\n- Current GL Limit: $${(report?.extracted_gl_limit || 0) / 1000000}M\n- Missing Additional Insured Endorsement: ${report?.has_additional_insured ? 'No' : 'Yes'}\n\nYou can instantly bridge this coverage gap and become compliant by onboarding with Fernstone.\n\nGet Coverage Now: https://fernstone.com/#cta`

    try {
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                sender_id: project.gc_id, // Acting on behalf of the GC
                receiver_id: subProfile.id,
                project_id: project.id,
                subject: `Action Required: Fix coverage for ${project?.name}`,
                body: body
            })

        if (msgError) {
            console.error("Failed to insert sales notification message:", msgError)
            return { error: `Message Failed: ${msgError.message}` }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Failed to notify Subcontractor (Catch block):', error)
        return { error: error.message || 'Failed to send onboarding message' }
    }
}
