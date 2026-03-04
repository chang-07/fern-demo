"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Building2, ExternalLink, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Mail } from "lucide-react"
import { ContactGCModal } from "@/components/ContactGCModal"
import { applyToJob } from "@/actions/apply-to-job"
import { toast } from "sonner"

interface ProjectRequirements {
    id?: string;
    name: string;
    req_gl_occurrence: number | null;
    req_auto_limit: number | null;
    req_wc_limit: number | null;
    req_umbrella_limit: number | null;
    req_additional_insured: boolean | null;
}

interface ProfileLimits {
    id: string;
    gl_limit: number | null;
    auto_limit: number | null;
    wc_limit: number | null;
    umbrella_limit: number | null;
    has_additional_insured: boolean | null;
}

export function JobPostingCard({
    job,
    gc,
    project,
    profileLimits
}: {
    job: any,
    gc: any,
    project: ProjectRequirements | null,
    profileLimits: ProfileLimits | null
}) {
    const [expanded, setExpanded] = useState(false)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)

    const handleApply = async () => {
        if (!profileLimits?.id) return

        setApplying(true)
        const res = await applyToJob(
            job.id,
            job.title,
            gc?.id || job.gc_id,
            project?.id || null,
            profileLimits.id
        )

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Successfully applied to job!")
            setApplied(true)
        }
        setApplying(false)
    }

    // Helper to compare limits safely
    const meetsLimit = (required: number | null | undefined, actual: number | null | undefined) => {
        if (!required) return true; // If not required, always pass
        if (!actual) return false;  // If required but we don't have it, fail
        return actual >= required;
    }

    // Helper to format currency
    const formatCurrency = (amount: number | null | undefined) => {
        if (!amount) return 'None';
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        return `$${(amount / 1000).toFixed(0)}k`;
    }

    const glMatch = meetsLimit(project?.req_gl_occurrence, profileLimits?.gl_limit)
    const autoMatch = meetsLimit(project?.req_auto_limit, profileLimits?.auto_limit)

    // Only bother computing "All Match" if there is actually a project to compare against
    const hasProjectMatch = project ? (glMatch && autoMatch) : null

    return (
        <Card
            className="bg-slate-900/50 border-slate-800 hover:border-slate-600 transition-all group flex flex-col overflow-hidden"
        >
            <div
                className="cursor-pointer p-6 pb-4"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                        <Building2 className="h-3 w-3 mr-1" />
                        {job.industry_focus}
                    </Badge>
                    {project ? (
                        hasProjectMatch ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Limits Match
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                <ShieldAlert className="w-3 h-3 mr-1" /> Gap Detected
                            </Badge>
                        )
                    ) : (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            New
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors flex justify-between items-start">
                    {job.title}
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 opacity-50 group-hover:opacity-100 flex-shrink-0 mt-1 ml-2 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 opacity-50 group-hover:opacity-100 flex-shrink-0 mt-1 ml-2 text-slate-400" />
                    )}
                </CardTitle>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                    Posted by <span className="text-slate-300">{gc?.company_name || gc?.email || 'A General Contractor'}</span>
                </div>
            </div>

            {/* Expandable Details Area */}
            {expanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/50 bg-slate-900/80 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-6">
                        {job.description}
                    </div>

                    {project ? (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-2 text-blue-400" />
                                Project Compliance Check: {project.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {/* GL Requirement */}
                                {project.req_gl_occurrence && (
                                    <div className={`p-3 rounded-lg border flex justify-between items-center ${glMatch ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-amber-950/30 border-amber-900/50'}`}>
                                        <div>
                                            <div className="text-slate-400 text-xs uppercase font-medium">Gen Liability</div>
                                            <div className="text-slate-200 mt-0.5">Required: {formatCurrency(project.req_gl_occurrence)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-medium uppercase ${glMatch ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {glMatch ? 'Match' : 'Cap'}
                                            </div>
                                            <div className={`mt-0.5 font-medium ${glMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {formatCurrency(profileLimits?.gl_limit)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Auto Requirement */}
                                {project.req_auto_limit && (
                                    <div className={`p-3 rounded-lg border flex justify-between items-center ${autoMatch ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-amber-950/30 border-amber-900/50'}`}>
                                        <div>
                                            <div className="text-slate-400 text-xs uppercase font-medium">Auto Liability</div>
                                            <div className="text-slate-200 mt-0.5">Required: {formatCurrency(project.req_auto_limit)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-medium uppercase ${autoMatch ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {autoMatch ? 'Match' : 'Cap'}
                                            </div>
                                            <div className={`mt-0.5 font-medium ${autoMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {formatCurrency(profileLimits?.auto_limit)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-sm text-slate-400 text-center">
                            This job posting does not have specific minimum insurance requirements listed. Contact the GC for details.
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-end gap-3">
                        {profileLimits?.id && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleApply(); }}
                                    disabled={applying || applied}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 h-10 px-6 py-2"
                                >
                                    {applied ? "Applied" : applying ? "Applying..." : "Apply Directly"}
                                </button>
                                <ContactGCModal
                                    subcontractorId={profileLimits.id}
                                    gcId={gc?.id || job.gc_id}
                                    projectName={project?.name || job.title}
                                    projectId={project?.id}
                                    defaultSubject={`Question regarding Job Posting: ${job.title}`}
                                    defaultMessage={`Hi,\n\nI have a question about the ${job.title} position you posted on Fernstone.\n\nThanks,\nApplicant`}
                                >
                                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 h-10 px-4 py-2">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact GC
                                    </button>
                                </ContactGCModal>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className={`mt-auto px-6 py-4 flex items-center justify-between ${!expanded ? 'border-t border-slate-800/50 bg-slate-900/50' : 'bg-slate-950/50'}`}>
                <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                </div>
                {!expanded && (
                    <div className="text-xs text-blue-400 font-medium group-hover:underline">
                        View Details {project && '& Coverage Match'}
                    </div>
                )}
            </div>
        </Card>
    )
}
