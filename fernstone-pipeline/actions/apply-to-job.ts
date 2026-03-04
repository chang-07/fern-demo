'use server'

import { createClient } from '@/utils/supabase/server'
import { messageGC } from './contact-gc'

export async function applyToJob(
    jobId: string,
    jobTitle: string,
    gcId: string,
    projectId: string | null,
    subcontractorId: string
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return { error: 'Unauthorized' }

    try {
        if (projectId) {
            // Check if already applied
            const { data: existing } = await supabase
                .from('subcontractors')
                .select('*')
                .eq('project_id', projectId)
                .eq('email', user.email)
                .single()

            if (!existing) {
                // Apply by inserting into subcontractors
                const { error: insertError } = await supabase
                    .from('subcontractors')
                    .insert({
                        project_id: projectId,
                        email: user.email,
                        status: 'INVITED' // Creates the pending connection
                    })

                if (insertError) throw new Error(insertError.message)
            }
        }

        // Send internal message
        const subject = `Application for Job Posting: ${jobTitle}`
        const message = `Hi,\n\nI have directly applied to the ${jobTitle} position you posted on Fernstone.\n\nPlease review my profile and insurance limits.\n\nThanks,\nApplicant`

        const result = await messageGC(subcontractorId, gcId, projectId, subject, message)
        if (result.error) throw new Error(result.error)

        return { success: true }
    } catch (error: any) {
        console.error('Apply to job error:', error)
        return { error: error.message || 'Failed to apply to job' }
    }
}
