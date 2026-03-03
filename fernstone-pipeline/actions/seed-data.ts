'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function seedData() {
    const supabase = await createClient()

    // 1. Get authenticated GC
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        // 2. Create a Mock Project (Neon City Block A)
        // Requires $2M GL, $1M Auto, $1M WC
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                gc_id: user.id,
                name: 'Neon City Block A - Highrise',
                req_gl_occurrence: 2000000,
                req_auto_limit: 1000000,
                req_wc_limit: 1000000,
                req_additional_insured: true,
                requirements: {
                    gl: { occurence: 2000000 },
                    auto: { combined_single_limit: 1000000 },
                    wc: { el_each_accident: 1000000 }
                }
            })
            .select()
            .single()

        if (projectError || !project) throw projectError

        const projectId = project.id

        // 3. Prepare Mock Subcontractors
        const mockSubs = [
            { email: 'sarah@apexbuilders.io', status: 'COMPLIANT' }, // 0
            { email: 'david@reliableplumbing.co', status: 'NON_COMPLIANT' }, // 1 (Minor Auto Gap)
            { email: 'carlos@skylineelectric.net', status: 'NON_COMPLIANT' }, // 2 (Major GL Gap & Missing Addl Insured)
            { email: 'emily@horizonroofing.com', status: 'UPLOADED' }, // 3 
            { email: 'jackson@ironworkers.llc', status: 'INVITED' }, // 4
        ]

        // Insert Subs
        const { data: insertedSubs, error: subError } = await supabase
            .from('subcontractors')
            .insert(mockSubs.map(s => ({ ...s, project_id: projectId })))
            .select()

        if (subError || !insertedSubs) throw subError

        // 4. Create Compliance Reports for processed subs

        // Next year date for expiry
        const nextYear = new Date()
        nextYear.setFullYear(nextYear.getFullYear() + 1)
        const expiryDate = nextYear.toISOString().split('T')[0]

        // Expired date
        const lastYear = new Date()
        lastYear.setFullYear(lastYear.getFullYear() - 1)
        const expiredDate = lastYear.toISOString().split('T')[0]

        const reports = [
            {
                // COMPLIANT (Apex Builders)
                sub_id: insertedSubs[0].id,
                is_compliant: true,
                extracted_gl_limit: 2000000,
                has_additional_insured: true,
                extracted_auto_limit: 1500000,
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: []
            },
            {
                // NON_COMPLIANT - Minor Gap (Reliable Plumbing)
                sub_id: insertedSubs[1].id,
                is_compliant: false,
                extracted_gl_limit: 2000000,
                has_additional_insured: true,
                extracted_auto_limit: 500000, // Gap: Need 1M, has 500k
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: ['Auto Liability Limit ($500,000) is below required ($1,000,000)']
            },
            {
                // NON_COMPLIANT - Major Gap (Skyline Electric)
                sub_id: insertedSubs[2].id,
                is_compliant: false,
                extracted_gl_limit: 1000000, // Gap: Need 2M, has 1M
                has_additional_insured: false, // Gap: Missing
                extracted_auto_limit: 1000000,
                extracted_wc_limit: 1000000,
                expiry_date: expiredDate, // Gap: Expired
                deficiencies: [
                    'GL Occurrence Limit ($1,000,000) is below required ($2,000,000)',
                    'Missing required Additional Insured endorsement',
                    `Policy is expired (Expired: ${expiredDate})`
                ]
            }
        ]

        const { error: reportsError } = await supabase
            .from('compliance_reports')
            .insert(reports)

        if (reportsError) throw reportsError

        // Revalidate the dashboard
        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/projects/${projectId}`)

        return { success: true }

    } catch (error: any) {
        console.error('Seed Data Error:', error)
        return { error: error.message || 'Failed to seed data' }
    }
}
