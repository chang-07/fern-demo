'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createJobPosting(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const industry_focus = formData.get('industry_focus') as string
    const project_id = formData.get('project_id') as string | null

    if (!title || !description || !industry_focus) {
        return { error: 'Title, description, and industry are required' }
    }

    try {
        const { error } = await supabase
            .from('job_postings')
            .insert({
                gc_id: user.id,
                title,
                description,
                industry_focus,
                project_id: project_id || null
            })

        if (error) throw error

        revalidatePath('/dashboard/market')
        revalidatePath('/subcontractor/market')

        return { success: true }
    } catch (error: any) {
        console.error('Create Job Posting Error:', error)
        return { error: error.message || 'Failed to create job posting' }
    }
}
