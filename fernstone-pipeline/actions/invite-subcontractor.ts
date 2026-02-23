'use server'

import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
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

    // Send email
    try {
        const { data, error } = await resend.emails.send({
            from: 'Fernstone <onboarding@resend.dev>', // Use resend.dev for testing unless verified domain
            to: [email],
            subject: `Insurance Verification Required: ${project.name}`,
            html: `
        <h1>Action Required: Upload Certificate of Insurance</h1>
        <p>You have been invited to submit your insurance documents for project <strong>${project.name}</strong>.</p>
        <p>Please click the link below to verify your coverage:</p>
        <p><a href="${magicLink}">${magicLink}</a></p>
        <p>This is a secure link for your company.</p>
      `
        })

        if (error) {
            console.error('Resend error:', error)
            return { error: `Email Failed: ${error.message}` }
        }
    } catch (error: any) {
        console.error('Email send try/catch error:', error)
        return { error: error.message || 'Failed to send invitation email' }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
}
