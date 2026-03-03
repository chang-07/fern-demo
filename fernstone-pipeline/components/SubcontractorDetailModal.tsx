"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface SubcontractorDetailModalProps {
    children: React.ReactNode;
    subcontractor: any; // Subcontractor with embedded project and compliance report
}

export function SubcontractorDetailModal({ children, subcontractor }: SubcontractorDetailModalProps) {
    const project = subcontractor.projects;
    const report = subcontractor.compliance_reports?.[0];

    const formatLimit = (value: number | undefined | null) => {
        if (value === null || value === undefined) return "N/A"
        return `$${(value / 1000000).toFixed(1)}M`
    }

    const renderComparisonRow = (label: string, required: any, extracted: any, isBoolean = false) => {
        let isMet = false;
        let reqDisplay = isBoolean ? (required ? 'Yes' : 'No') : formatLimit(required);
        let extDisplay = isBoolean ? (extracted ? 'Yes' : 'No') : formatLimit(extracted);

        if (required === null || required === undefined) {
            // If not required, whatever they have is fine
            isMet = true;
            reqDisplay = "None"
        } else if (isBoolean) {
            isMet = extracted === required;
        } else {
            isMet = (extracted || 0) >= required;
        }

        return (
            <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div className="text-sm font-medium text-slate-300 w-1/3">{label}</div>
                <div className="text-sm text-slate-500 w-1/4 text-center">{reqDisplay}</div>
                <div className={`text-sm font-medium w-1/4 text-center ${isMet ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {extDisplay}
                </div>
                <div className="w-10 flex justify-end">
                    {isMet ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                        <XCircle className="w-5 h-5 text-amber-500" />
                    )}
                </div>
            </div>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <div className="flex items-center justify-between mt-2">
                        <DialogTitle className="text-xl">{subcontractor.email}</DialogTitle>
                        <Badge variant="outline" className={
                            subcontractor.status === 'COMPLIANT' ? "bg-emerald-900/20 text-emerald-500 border-emerald-900" :
                                subcontractor.status === 'APPROVED' ? "bg-blue-900/20 text-blue-500 border-blue-900" :
                                    "bg-amber-900/20 text-amber-500 border-amber-900"
                        }>
                            {subcontractor.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="mt-6">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Coverage Breakdown</h4>

                        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 uppercase w-1/3">Coverage</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase w-1/4 text-center">Required</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase w-1/4 text-center">Extracted</span>
                                <span className="w-10"></span>
                            </div>

                            {renderComparisonRow("GL Occurrence", project?.req_gl_occurrence, report?.extracted_gl_limit)}
                            {renderComparisonRow("Auto Limit", project?.req_auto_limit, report?.extracted_auto_limit)}
                            {renderComparisonRow("WC Limit", project?.req_wc_limit, report?.extracted_wc_limit)}
                            {renderComparisonRow("Umbrella Limit", project?.req_umbrella_limit, report?.extracted_umbrella_limit)}
                            {renderComparisonRow("Addl. Insured", project?.req_additional_insured, report?.has_additional_insured, true)}
                        </div>
                    </div>

                    {report && report.deficiencies && report.deficiencies.length > 0 && (
                        <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-4 mt-6">
                            <h4 className="text-sm font-semibold text-amber-500 mb-2 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Detected Gaps
                            </h4>
                            <ul className="text-sm text-amber-400/80 space-y-1 ml-6 list-disc marker:text-amber-700">
                                {report.deficiencies.map((def: string, i: number) => (
                                    <li key={i}>{def}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {report && report.expiry_date && (
                        <div className="mt-4 text-xs text-slate-500 text-right">
                            Policy Expiry: <span className="text-slate-400">{new Date(report.expiry_date).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
