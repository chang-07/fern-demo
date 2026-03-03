'use server'

import { createClient } from '@supabase/supabase-js'
import { parseInsuranceDoc } from '@/lib/llama-parse'
import { extractInsuranceData } from '@/lib/openai'
import { revalidatePath } from 'next/cache'

export async function processGeneralDocument(userId: string, filePath: string) {
    // Admin client to bypass RLS for background processing
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(`Processing general document for ${userId} at ${filePath}`)

    try {
        // 1. Download file from Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('coi-documents')
            .download(filePath)

        if (downloadError) throw downloadError

        // Convert Blob to Buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const fileName = filePath.split('/').pop() || 'document.pdf'

        // 2. Parse PDF to Markdown (LlamaParse)
        const markdown = await parseInsuranceDoc(buffer, fileName)

        // 3. Extract Data (OpenAI)
        const insuranceData = await extractInsuranceData(markdown)
        console.log("Extracted General Data:", insuranceData)

        // 4. Update the Profile with new limits
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                gl_limit: insuranceData.gl_occurrence,
                auto_limit: insuranceData.auto_combined_single_limit,
                wc_limit: insuranceData.wc_each_accident,
                umbrella_limit: insuranceData.umbrella_occurrence,
                has_additional_insured: insuranceData.additional_insured,
                expiry_date: insuranceData.expiry_date
            })
            .eq('id', userId)

        if (profileError) throw profileError

        // Revalidate paths so the UI updates
        revalidatePath('/subcontractor')
        revalidatePath('/dashboard/market')

        return { success: true }

    } catch (error: any) {
        console.error("General Processing Error:", error)
        return { error: error.message || "Failed to process general document" }
    }
}
