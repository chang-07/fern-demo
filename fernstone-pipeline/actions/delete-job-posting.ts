'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteJobPosting(postingId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        // RLS will ensure a GC can only delete their own postings,
        // but we'll scope it to gc_id anyway for double safety.
        const { error } = await supabase
            .from('job_postings')
            .delete()
            .eq('id', postingId)
            .eq('gc_id', user.id)

        if (error) throw error

        revalidatePath('/dashboard/market')
        revalidatePath('/subcontractor/market')

        return { success: true }
    } catch (error: any) {
        console.error('Delete Job Posting Error:', error)
        return { error: error.message || 'Failed to delete job posting' }
    }
}
