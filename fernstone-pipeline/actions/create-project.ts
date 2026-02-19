'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // Ideally redirect to login, but for now we might error or just return
        // In a real app we'd redirect to /login
        return { error: 'User not authenticated' }
    }

    const name = formData.get('name') as string
    const req_gl_occurrence = formData.get('req_gl_occurrence') as string
    const req_additional_insured = formData.get('req_additional_insured') === 'on'

    if (!name) {
        return { error: 'Project name is required' }
    }

    const { error } = await supabase.from('projects').insert({
        gc_id: user.id,
        name,
        req_gl_occurrence: req_gl_occurrence ? parseInt(req_gl_occurrence) : 2000000,
        req_additional_insured,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
