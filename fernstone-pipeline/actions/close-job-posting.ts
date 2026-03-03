'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function closeJobPosting(postingId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        const { error } = await supabase
            .from('job_postings')
            .update({ status: 'CLOSED' })
            .eq('id', postingId)
            .eq('gc_id', user.id) // Ensure only the owner can close it

        if (error) throw error

        revalidatePath('/dashboard/postings')
        revalidatePath('/subcontractor/market/jobs')

        return { success: true }
    } catch (error: any) {
        console.error('Close Job Posting Error:', error)
        return { error: error.message || 'Failed to close job posting' }
    }
}
