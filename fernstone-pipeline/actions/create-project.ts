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
    const glLimit = parseInt(formData.get('glLimit') as string) || 1000000
    const aggregateLimit = parseInt(formData.get('aggregateLimit') as string) || 2000000
    // We could add more fields here (WC, Auto, etc.)

    if (!name) {
        return { error: 'Project name is required' }
    }

    const { error: insertError } = await supabase
        .from('projects')
        .insert({
            gc_id: user.id,
            name,
            req_gl_occurrence: glLimit,
            requirements: {
                gl: {
                    occurrence: glLimit,
                    aggregate: aggregateLimit
                }
            }
        })

    if (insertError) {
        return { error: insertError.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
