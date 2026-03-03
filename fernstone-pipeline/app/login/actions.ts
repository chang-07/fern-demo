'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    // Route based on role
    let redirectUrl = '/dashboard';
    if (authData.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single()

        if (profile?.role === 'SUBCONTRACTOR') {
            redirectUrl = '/subcontractor'
        }
    }

    revalidatePath('/', 'layout')
    redirect(redirectUrl)
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'GC'

    const data = { email, password }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    // Create the profile record
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: authData.user.email || '',
                role: role
            })

        if (profileError) {
            console.error("Profile creation error:", profileError)
            // In a robust app we might want to clean up or alert here
        }
    }

    revalidatePath('/', 'layout')

    if (role === 'SUBCONTRACTOR') {
        redirect('/subcontractor')
    } else {
        redirect('/dashboard')
    }
}
