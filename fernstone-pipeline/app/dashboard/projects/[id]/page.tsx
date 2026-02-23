
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { SubcontractorTable } from "@/components/SubcontractorTable"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Plus } from "lucide-react"
import Link from "next/link"
import { InviteSubcontractorModal } from "@/components/InviteSubcontractorModal"

// Params need to be awaited in Next.js 15
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch project details
    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

    if (!project) {
        notFound()
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                            <span className="font-medium text-slate-300">GL:</span> ${(project.req_gl_occurrence || 0) / 1000000}M
                        </div>
                        {project.req_auto_limit ? (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                                <span className="font-medium text-slate-300">Auto:</span> ${(project.req_auto_limit) / 1000000}M
                            </div>
                        ) : null}
                        {project.req_wc_limit ? (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                                <span className="font-medium text-slate-300">WC:</span> ${(project.req_wc_limit) / 1000000}M
                            </div>
                        ) : null}
                        {project.req_umbrella_limit ? (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                                <span className="font-medium text-slate-300">Umbrella:</span> ${(project.req_umbrella_limit) / 1000000}M
                            </div>
                        ) : null}
                    </div>

                </div>
                <div className="ml-auto">
                    <InviteSubcontractorModal projectId={id} />
                </div>
            </div>

            <SubcontractorTable projectId={id} />
        </div>
    )
}
