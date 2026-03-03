'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProject(projectId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId)
            .eq('gc_id', user.id)

        if (error) throw error

        revalidatePath('/dashboard/projects')

        // Also revalidate paths that might rely on this project (like market/job postings)
        revalidatePath('/dashboard/market')
        revalidatePath('/subcontractor/market')

        return { success: true }
    } catch (error: any) {
        console.error('Delete Project Error:', error)
        return { error: error.message || 'Failed to delete project' }
    }
}
