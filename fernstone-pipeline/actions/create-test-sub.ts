'use server'

import { createClient } from '@supabase/supabase-js'

// We need the service role key to forcefully create auth users without email confirmation requirements
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createTestSubcontractor() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const email = 'test@example.com'
    const password = 'test'

    try {
        // 1. Create the auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Auto-confirm the email
        })

        if (authError) {
            // If user already exists, let's just update their profile
            if (authError.message.includes('User already registered')) {
                const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single()
                if (existingUser) {
                    await supabase.from('profiles').update({
                        role: 'SUBCONTRACTOR',
                        company_name: 'Test Subcontracting LLC',
                        industry: 'General Labor',
                        description: 'This is a test subcontractor profile injected for development.'
                    }).eq('id', existingUser.id)
                    return { success: true, message: "User existed, updated profile." }
                }
            }
            throw authError
        }

        const userId = authData.user.id

        // 2. Create the associated profile record
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                role: 'SUBCONTRACTOR',
                company_name: 'Test Subcontracting LLC',
                industry: 'General Labor',
                description: 'This is a test subcontractor profile injected for development.'
            })

        if (profileError) throw profileError

        return { success: true, message: `Created test subcontractor with email: ${email}` }
    } catch (error: any) {
        console.error("Test User Creation Error:", error)
        return { error: error.message || "Failed to create test user." }
    }
}
