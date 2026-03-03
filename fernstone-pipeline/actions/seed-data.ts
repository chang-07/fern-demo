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
        // 2. Create Mock Projects
        const projectsToInsert = [
            {
                gc_id: user.id,
                name: 'Neon City Block A - Highrise',
                req_gl_occurrence: 5000000,
                req_auto_limit: 2000000,
                req_wc_limit: 1000000,
                req_additional_insured: true,
                requirements: {
                    gl: { aggregate: 10000000 },
                    auto: { combined_single_limit: 2000000 },
                    wc: { el_each_accident: 1000000 }
                }
            },
            {
                gc_id: user.id,
                name: 'Azure Tech Campus - Core Shell',
                req_gl_occurrence: 2000000,
                req_auto_limit: 1000000,
                req_wc_limit: 1000000,
                req_additional_insured: true,
                requirements: {
                    gl: { aggregate: 4000000 },
                    auto: { combined_single_limit: 1000000 },
                    wc: { el_each_accident: 1000000 }
                }
            }
        ]

        const { data: insertedProjects, error: projectError } = await supabase
            .from('projects')
            .insert(projectsToInsert)
            .select()

        if (projectError || !insertedProjects) throw projectError

        const project1Id = insertedProjects[0].id
        const project2Id = insertedProjects[1].id

        // 3. Prepare Mock Subcontractors
        const mockSubs = [
            // Project 1 Subs
            {
                project_id: project1Id,
                email: 'estimating@summitsteel.com',
                status: 'COMPLIANT',
                company_name: 'Summit Structural Steel',
                industry: 'Structural Steel Erection',
                description: 'Tier 1 structural steel fabrication and erection for mid to high-rise commercial buildings. AISC certified.'
            },
            {
                project_id: project1Id,
                email: 'bids@blueoceanmep.com',
                status: 'COMPLIANT',
                company_name: 'Blue Ocean Plumbing & HVAC',
                industry: 'Mechanical & Plumbing',
                description: 'Large-scale commercial plumbing, HVAC installation, and industrial piping. Union shop with 200+ technicians.'
            },
            {
                project_id: project1Id,
                email: 'projects@vanguardelectric.net',
                status: 'NON_COMPLIANT',
                company_name: 'Vanguard Electrical Systems',
                industry: 'Commercial Electrical',
                description: 'High-voltage systems, switchgear installation, telecommunications, and smart-building integrations.'
            },
            {
                project_id: project1Id,
                email: 'ops@ironcladdemo.com',
                status: 'INVITED',
                company_name: 'Ironclad Demolition',
                industry: 'Demolition & Abatement',
                description: 'Structural demolition, hazardous materials abatement, and site clearing services.'
            },
            // Project 2 Subs
            {
                project_id: project2Id,
                email: 'dispatch@precisioncoring.io',
                status: 'NON_COMPLIANT',
                company_name: 'Precision Concrete',
                industry: 'Concrete & Masonry',
                description: 'Concrete pouring, core drilling, foundation work, and heavy masonry for commercial developments.'
            },
            {
                project_id: project2Id,
                email: 'info@cascaderoofing.co',
                status: 'UPLOADED',
                company_name: 'Cascade Roofing Solutions',
                industry: 'Commercial Roofing',
                description: 'TPO, EPDM, and green roof installations. Focuses on LEED-certified weatherproofing.'
            },
            {
                project_id: project2Id,
                email: 'commercial@evergreenlandscapes.com',
                status: 'INVITED',
                company_name: 'Evergreen Hardscapes',
                industry: 'Landscaping & Hardscape',
                description: 'Commercial retaining walls, paving, corporate park landscaping, and irrigation systems.'
            },
            {
                project_id: project2Id,
                email: 'contracts@titanframing.llc',
                status: 'COMPLIANT',
                company_name: 'Titan Framing & Drywall',
                industry: 'Interior Build-out',
                description: 'Heavy-gauge metal framing, drywall installation, and acoustical ceilings for corporate offices.'
            }
        ]

        // Insert Subs
        const { data: insertedSubs, error: subError } = await supabase
            .from('subcontractors')
            .insert(mockSubs)
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
            // P1: Summit Steel (Compliant)
            {
                sub_id: insertedSubs[0].id,
                is_compliant: true,
                extracted_gl_limit: 5000000,
                has_additional_insured: true,
                extracted_auto_limit: 2000000,
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: []
            },
            // P1: Blue Ocean (Compliant)
            {
                sub_id: insertedSubs[1].id,
                is_compliant: true,
                extracted_gl_limit: 10000000,
                has_additional_insured: true,
                extracted_auto_limit: 5000000,
                extracted_wc_limit: 2000000,
                expiry_date: expiryDate,
                deficiencies: []
            },
            // P1: Vanguard Electrical (Non-Compliant - Auto Gap)
            {
                sub_id: insertedSubs[2].id,
                is_compliant: false,
                extracted_gl_limit: 5000000,
                has_additional_insured: true,
                extracted_auto_limit: 1000000, // Needs 2M
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: ['Auto Liability Limit ($1,000,000) is below required ($2,000,000)']
            },
            // P2: Precision Concrete (Non-Compliant - Major Gaps)
            {
                sub_id: insertedSubs[3].id, // Wait, Precision Concrete is index 4 in insertedSubs! Ah, let me fix the indices.
                // Wait, I will match by email to be safe.
            }
        ]

        const findId = (email: string) => insertedSubs.find(s => s.email === email)?.id as string

        const dynamicReports = [
            // P1: Summit Steel (Compliant, P1 requires 5M GL)
            {
                sub_id: findId('estimating@summitsteel.com'),
                is_compliant: true,
                extracted_gl_limit: 5000000,
                has_additional_insured: true,
                extracted_auto_limit: 2000000,
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: []
            },
            // P1: Blue Ocean (Compliant)
            {
                sub_id: findId('bids@blueoceanmep.com'),
                is_compliant: true,
                extracted_gl_limit: 10000000,
                has_additional_insured: true,
                extracted_auto_limit: 5000000,
                extracted_wc_limit: 2000000,
                expiry_date: expiryDate,
                deficiencies: []
            },
            // P1: Vanguard Electrical (Non-Compliant - Auto Gap)
            {
                sub_id: findId('projects@vanguardelectric.net'),
                is_compliant: false,
                extracted_gl_limit: 5000000,
                has_additional_insured: true,
                extracted_auto_limit: 1000000, // Needs 2M
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: ['Auto Liability Limit ($1,000,000) is below required ($2,000,000)']
            },
            // P2: Precision Concrete (Non-Compliant - Major Gaps. P2 requires 2M GL)
            {
                sub_id: findId('dispatch@precisioncoring.io'),
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
            },
            // P2: Titan Framing (Compliant)
            {
                sub_id: findId('contracts@titanframing.llc'),
                is_compliant: true,
                extracted_gl_limit: 2000000,
                has_additional_insured: true,
                extracted_auto_limit: 1000000,
                extracted_wc_limit: 1000000,
                expiry_date: expiryDate,
                deficiencies: []
            }
        ]

        const { error: reportsError } = await supabase
            .from('compliance_reports')
            .insert(dynamicReports)

        if (reportsError) throw reportsError

        // Revalidate the dashboard
        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/projects/${project1Id}`)
        revalidatePath(`/dashboard/projects/${project2Id}`)

        return { success: true }

    } catch (error: any) {
        console.error('Seed Data Error:', error)
        return { error: error.message || 'Failed to seed data' }
    }
}
