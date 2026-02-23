'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'User not authenticated' }
    }

    const name = formData.get('name') as string

    // Helper to get number from formData or default to 0
    const getNum = (key: string, def = 0) => {
        const val = formData.get(key)
        return val ? parseInt(val as string) : def
    }

    // Helper to get checkbox boolean
    const getBool = (key: string) => formData.get(key) === 'on'

    const glOccurrence = getNum('gl_occurrence', 1000000)

    if (!name) {
        return { error: 'Project name is required' }
    }

    // Construct the robust requirements object
    const requirements = {
        gl: {
            occurrence: glOccurrence,
            aggregate: getNum('gl_aggregate', 2000000),
            products_comp_op_agg: getNum('gl_products', 2000000),
            personal_adv_injury: getNum('gl_personal', 1000000),
            damage_to_rented_premises: getNum('gl_rented', 100000),
            med_exp: getNum('gl_med', 5000)
        },
        auto: {
            combined_single_limit: getNum('auto_csl', 1000000),
            any_auto: getBool('auto_any'),
            hired_auto: getBool('auto_hired'),
            non_owned_auto: getBool('auto_non_owned')
        },
        wc: {
            statutory_limits: getBool('wc_statutory'),
            el_each_accident: getNum('wc_el_accident', 1000000),
            el_disease_policy: getNum('wc_el_disease_policy', 1000000),
            el_disease_employee: getNum('wc_el_disease_employee', 1000000),
            waiver_subrogation: getBool('wc_waiver')
        },
        umbrella: {
            each_occurrence: getNum('umbrella_occ', 1000000),
            aggregate: getNum('umbrella_agg', 1000000)
        },
        certificate_holder: formData.get('certificate_holder') as string || ''
    }

    const { error: insertError } = await supabase
        .from('projects')
        .insert({
            gc_id: user.id,
            name,
            req_gl_occurrence: glOccurrence,
            req_auto_limit: getNum('auto_csl', null as any),
            req_wc_limit: getNum('wc_el_accident', null as any),
            req_umbrella_limit: getNum('umbrella_occ', null as any),
            requirements
        })

    if (insertError) {
        return { error: insertError.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
