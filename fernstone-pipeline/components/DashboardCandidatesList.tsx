'use client'

import { useOptimistic, startTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileCheck, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ApproveSubcontractorButton } from "@/components/ApproveSubcontractorButton"
import { SubcontractorDetailModal } from "@/components/SubcontractorDetailModal"
import { SendReminderButton } from "@/components/SendReminderButton"

export function DashboardCandidatesList({ initialCompliantSubs, initialNonCompliantSubs }: { initialCompliantSubs: any[], initialNonCompliantSubs: any[] }) {
    // We combine them into a single list for optimistic updates so moving a sub from non-compliant to compliant removes it instantly
    const allSubs = [...initialCompliantSubs, ...initialNonCompliantSubs]

    const [optimisticSubs, addOptimisticUpdate] = useOptimistic(
        allSubs,
        (state, newUpdate: { id: string, status: string }) => {
            return state.map(sub =>
                sub.id === newUpdate.id
                    ? { ...sub, status: newUpdate.status }
                    : sub
            )
        }
    )

    const optCompliant = optimisticSubs.filter(s => s.status === 'COMPLIANT')
    const optNonCompliant = optimisticSubs.filter(s => s.status === 'NON_COMPLIANT')

    const handleApprove = (id: string) => {
        startTransition(() => {
            addOptimisticUpdate({ id, status: 'APPROVED' }) // Assuming 'APPROVED' is a state we can use to just hide it, or we keep it 'COMPLIANT' but we need to know it was clicked. Let's look at ApproveSubcontractorButton.
        })
    }

    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Best Candidates */}
            <Card className="bg-slate-900 border-emerald-900/50">
                <CardHeader className="border-b border-slate-800">
                    <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                        <FileCheck className="w-5 h-5" />
                        Best Candidates for Approval
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Subcontractors with verified 100% compliance. Ready to begin work.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {optCompliant.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No compliant candidates available yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {optCompliant.map((sub: any) => {
                                const project = sub.projects;
                                const report = sub.compliance_reports?.[0];
                                return (
                                    <SubcontractorDetailModal key={sub.id} subcontractor={sub}>
                                        <div className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                            <div>
                                                <div className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{sub.email}</div>
                                                <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                                    <span>Project: {project?.name}</span>
                                                    <span>•</span>
                                                    <span className="text-emerald-500 font-medium">
                                                        Verified GL: ${(report?.extracted_gl_limit || 0) / 1000000}M
                                                    </span>
                                                </div>
                                            </div>
                                            <div onClick={(e) => {
                                                // Optimistic hide
                                                e.stopPropagation()
                                                startTransition(() => {
                                                    addOptimisticUpdate({ id: sub.id, status: 'APPROVED' })
                                                })
                                            }}>
                                                <ApproveSubcontractorButton subcontractorId={sub.id} />
                                            </div>
                                        </div>
                                    </SubcontractorDetailModal>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attention Required */}
            <Card className="bg-slate-900 border-amber-900/40">
                <CardHeader className="border-b border-slate-800">
                    <CardTitle className="text-lg text-amber-500 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        Attention Required
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Subcontractors missing required coverage. Fernstone is working to bridge these gaps.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {optNonCompliant.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">All uploaded documents meet requirements.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {optNonCompliant.map((sub: any) => {
                                const project = sub.projects;
                                const report = sub.compliance_reports?.[0];
                                return (
                                    <SubcontractorDetailModal key={sub.id} subcontractor={sub}>
                                        <div className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors">{sub.email}</div>
                                                <Badge variant="outline" className="bg-amber-900/20 text-amber-500 border-amber-900">
                                                    Gap Detected
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-slate-400 mb-2">
                                                Project: <span className="text-slate-300">{project?.name}</span>
                                            </div>
                                            {report?.deficiencies?.length > 0 && (
                                                <div className="bg-slate-950 p-2 text-xs rounded border border-slate-800 text-amber-400/80 mb-3 space-y-1">
                                                    {report.deficiencies.map((def: string, i: number) => (
                                                        <div key={i}>• {def}</div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <SendReminderButton />
                                            </div>
                                        </div>
                                    </SubcontractorDetailModal>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
