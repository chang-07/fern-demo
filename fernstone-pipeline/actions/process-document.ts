'use server'

import { createClient } from '@supabase/supabase-js'
import { parseInsuranceDoc } from '@/lib/llama-parse'
import { extractInsuranceData } from '@/lib/openai'
import { revalidatePath } from 'next/cache'

export async function processDocument(subcontractorId: string, filePath: string) {
    // Admin client to bypass RLS for background processing
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(`Processing document for ${subcontractorId} at ${filePath}`)

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
        // Note: LlamaParse requires LLAMA_CLOUD_API_KEY in env
        const markdown = await parseInsuranceDoc(buffer, fileName)

        // 3. Extract Data (OpenAI)
        // Note: OpenAI requires OPENAI_API_KEY in env
        const insuranceData = await extractInsuranceData(markdown)

        console.log("Extracted Data:", insuranceData)

        // 4. Fetch Project Requirements
        const { data: sub } = await supabase
            .from('subcontractors')
            .select(`
            *,
            projects (
                id,
                req_gl_occurrence,
                req_additional_insured,
                req_auto_limit,
                req_wc_limit,
                req_umbrella_limit
            )
        `)
            .eq('id', subcontractorId)
            .single()

        if (!sub || !sub.projects) throw new Error('Subcontractor or Project not found')

        const project = sub.projects as any // Supabase join types can be tricky
        const requiredLimit = project.req_gl_occurrence || 0

        // 5. Compare & Determine Compliance
        const glLimit = insuranceData.gl_occurrence || 0
        // Check if limit is sufficient (e.g. 1000000 >= 2000000)
        const isLimitCompliant = glLimit >= requiredLimit

        // Check additional insured
        const hasAddlInsured = insuranceData.additional_insured === true
        const isAddlInsuredCompliant = !project.req_additional_insured || hasAddlInsured

        const isNotExpired = insuranceData.expiry_date ? new Date(insuranceData.expiry_date) > new Date() : false

        // Check Auto, WC, Umbrella 
        const isAutoCompliant = project.req_auto_limit ? (insuranceData.auto_combined_single_limit || 0) >= project.req_auto_limit : true
        const isWcCompliant = project.req_wc_limit ? (insuranceData.wc_each_accident || 0) >= project.req_wc_limit : true
        const isUmbrellaCompliant = project.req_umbrella_limit ? (insuranceData.umbrella_occurrence || 0) >= project.req_umbrella_limit : true

        const isCompliant = isLimitCompliant && isAddlInsuredCompliant && isNotExpired && isAutoCompliant && isWcCompliant && isUmbrellaCompliant

        // Calculate Deficiencies
        const deficiencies: string[] = []
        if (!isLimitCompliant) {
            deficiencies.push(`GL Occurrence Limit ($${glLimit.toLocaleString()}) is below required ($${requiredLimit.toLocaleString()})`)
        }
        if (!isAddlInsuredCompliant) {
            deficiencies.push("Missing required Additional Insured endorsement")
        }
        if (!isNotExpired) {
            deficiencies.push(`Policy is expired (Expired: ${insuranceData.expiry_date})`)
        }
        if (!isAutoCompliant) {
            deficiencies.push(`Auto Liability Limit ($${(insuranceData.auto_combined_single_limit || 0).toLocaleString()}) is below required ($${project.req_auto_limit.toLocaleString()})`)
        }
        if (!isWcCompliant) {
            deficiencies.push(`Workers Comp Limit ($${(insuranceData.wc_each_accident || 0).toLocaleString()}) is below required ($${project.req_wc_limit.toLocaleString()})`)
        }
        if (!isUmbrellaCompliant) {
            deficiencies.push(`Umbrella Limit ($${(insuranceData.umbrella_occurrence || 0).toLocaleString()}) is below required ($${project.req_umbrella_limit.toLocaleString()})`)
        }

        // 6. Save Compliance Report
        // First, check if report exists? Schema ID is UUID default gen.
        // We can just insert a new one or update.
        // For simplicity, we insert a new report.
        const { error: reportError } = await supabase
            .from('compliance_reports')
            .insert({
                sub_id: subcontractorId,
                extracted_gl_limit: glLimit,
                has_additional_insured: hasAddlInsured,
                extracted_auto_limit: insuranceData.auto_combined_single_limit,
                has_any_auto: insuranceData.auto_has_any_auto,
                extracted_wc_limit: insuranceData.wc_each_accident,
                wc_statutory_limits: insuranceData.wc_statutory_limits,
                extracted_umbrella_limit: insuranceData.umbrella_occurrence,
                expiry_date: insuranceData.expiry_date,
                raw_ai_output: insuranceData as any,
                is_compliant: isCompliant,
                deficiencies: deficiencies as any // JSONB
            })

        if (reportError) throw reportError

        // 7. Update Subcontractor Status
        const newStatus = isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT'
        await supabase.from('subcontractors').update({ status: newStatus }).eq('id', subcontractorId)

        // Revalidate paths
        revalidatePath(`/dashboard/projects/${sub.project_id}`)
        if (sub.magic_link_token) {
            // We can't easily revalidate a dynamic route by regex, but we know the path
            // path is /verify/[token]
            // But revalidatePath takes the path string.
            // Wait, does revalidatePath work with params? Yes.
            // Or revalidatePath('/verify/[token]', 'page')
        }

        return { success: true }

    } catch (error: any) {
        console.error("Processing Error:", error)
        return { error: error.message || "Failed to process document" }
    }
}
