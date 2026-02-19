
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { UploadCard } from "@/components/UploadCard"
import { UpsellButton } from "@/components/UpsellButton"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createClient()

    // Validate token and fetch subcontractor + project details
    const { data: sub } = await supabase
        .from("subcontractors")
        .select(`
      *,
      projects (
        name,
        req_gl_occurrence
      ),
      compliance_reports (
        is_compliant,
        extracted_gl_limit,
        has_additional_insured
      )
    `)
        .eq("magic_link_token", token)
        .single()

    if (!sub || !sub.projects) {
        notFound()
    }

    const project = sub.projects
    const report = sub.compliance_reports?.[0]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
            <header className="border-b border-slate-800 bg-slate-900 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-emerald-500" />
                        <span className="text-xl font-bold tracking-tight text-white">Fernstone</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">Insurance Verification</h1>
                        <p className="text-slate-400">
                            Project: <span className="text-white font-medium">{project.name}</span>
                        </p>
                    </div>

                    {/* State 1: Compliant */}
                    {report?.is_compliant && (
                        <div className="bg-emerald-900/20 border border-emerald-900 rounded-lg p-6 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-500">You are Compliant!</h3>
                            <p className="text-slate-400 text-sm">
                                Your Certificate of Insurance meets all requirements for this project. No further action is needed.
                            </p>
                        </div>
                    )}

                    {/* State 2: Non-Compliant / Gap Detected */}
                    {report && !report.is_compliant && (
                        <div className="bg-amber-900/20 border border-amber-900 rounded-lg p-6 space-y-4">
                            <div className="flex items-center gap-3 text-amber-500 mb-2">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Coverage Gap Detected</h3>
                            </div>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p>We analyzed your COI and found the following issues:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {report.extracted_gl_limit && report.extracted_gl_limit < (project.req_gl_occurrence || 0) && (
                                        <li>
                                            GL Limit: Found <strong>${report.extracted_gl_limit / 1000000}M</strong>,
                                            Required <strong>${(project.req_gl_occurrence || 0) / 1000000}M</strong>
                                        </li>
                                    )}
                                    {report.has_additional_insured === false && (
                                        <li>Missing "Additional Insured" endorsement</li>
                                    )}
                                </ul>
                            </div>

                            {/* Upsell / Fix It Action (Phase 7) */}
                            <div className="pt-4 border-t border-amber-900/50">
                                <UpsellButton subcontractorId={sub.id} />
                            </div>
                        </div>
                    )}

                    {/* State 3: Pending Upload */}
                    {!report && (
                        <UploadCard subcontractorId={sub.id} token={token} />
                    )}
                </div>
            </main>
        </div>
    )
}
