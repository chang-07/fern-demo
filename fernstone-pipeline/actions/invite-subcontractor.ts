'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function inviteSubcontractor(formData: FormData) {
    const supabase = await createClient()

    // Get current user (GC)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'User not authenticated' }
    }

    const projectId = formData.get('projectId') as string
    const email = formData.get('email') as string

    if (!projectId || !email) {
        return { error: 'Project ID and email are required' }
    }

    // Verify project belongs to GC
    const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .eq('gc_id', user.id)
        .single()

    if (!project) {
        return { error: 'Project not found or unauthorized' }
    }

    // Create subcontractor record with magic token
    // The default for magic_link_token is uuid_generate_v4(), but we can also explicitely generate or select it.
    // Ideally, we let the DB generate it and return it.
    const { data: subcontractor, error: insertError } = await supabase
        .from('subcontractors')
        .insert({
            project_id: projectId,
            email,
            status: 'INVITED'
        })
        .select('magic_link_token')
        .single()

    if (insertError) {
        return { error: insertError.message }
    }

    const token = subcontractor.magic_link_token

    // Construct magic link
    // In production, use a proper base URL env var
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/verify/${token}`

    console.log('--- MAGIC LINK (For Dev) ---')
    console.log(magicLink)
    console.log('----------------------------')

    // 1. Find or create the user so they can receive the message
    let receiverId = null

    // Check if profile exists
    const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (existingProfile) {
        receiverId = existingProfile.id
    } else {
        // We must use service role to create users directly without needing them to click a confirmation link
        const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

        const { data: newAuthUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
            email: email,
            email_confirm: true,
            // Generate a random secure password they'll never use due to magic links
            password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "A1!",
        });

        if (createUserError) {
            console.error("Failed to create auth user for invite:", createUserError)
        } else if (newAuthUser.user) {
            receiverId = newAuthUser.user.id
            // Create their profile
            await (adminSupabase as any).from('profiles').insert({
                id: receiverId,
                email: email,
                role: 'SUBCONTRACTOR',
                company_name: email.split('@')[0], // Placeholder
                points: 0
            })
        }
    }

    if (receiverId) {
        // Send internal message
        const { error: messageError } = await (supabase as any)
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                project_id: projectId,
                subject: `Insurance Verification Required: ${project.name}`,
                body: `You have been invited to submit your insurance documents for project ${project.name}.\n\nPlease click the link below to verify your coverage:\n${magicLink}\n\nThis is a secure link for your company.`
            });

        if (messageError) {
            console.error("Failed to insert message:", messageError);
        }
    } else {
        console.warn('Could not determine receiverId to send internal message.')
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
}
