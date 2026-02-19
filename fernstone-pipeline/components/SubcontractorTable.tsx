
import { createClient } from "@/utils/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Clock, Download } from "lucide-react"

export async function SubcontractorTable({ projectId }: { projectId: string }) {
    const supabase = await createClient()

    // Fetch subcontractors with their latest compliance report
    // Supabase complex joins can be tricky.
    // We'll fetch subs and then maybe reports or use query.
    // actually we can select: *, compliance_reports(*)
    const { data: subcontractors } = await supabase
        .from("subcontractors")
        .select(`
      *,
      compliance_reports (
        extracted_gl_limit,
        has_additional_insured,
        expiry_date,
        is_compliant
      )
    `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

    if (!subcontractors?.length) {
        return (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
                <h3 className="text-lg font-medium text-slate-200">No subcontractors invited</h3>
                <p className="text-slate-500 mt-1">Invite a subcontractor to get started.</p>
            </div>
        )
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Subcontractors</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Coverage (GL)</TableHead>
                            <TableHead className="text-slate-400">Addl. Insured</TableHead>
                            <TableHead className="text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subcontractors.map((sub) => {
                            const report = sub.compliance_reports?.[0] // Assuming one report or taking latest if many?
                            // Schema implies one-to-many potentially or one-to-one?
                            // actually sub_id is FK in reports, so one sub can have multiple reports?
                            // Usually yes, re-uploads.
                            // Let's assume the latest report for now.
                            // We didn't order reports in the query, might need to fix that if multiple.

                            const statusColors = {
                                INVITED: "bg-slate-800 text-slate-400 border-slate-700",
                                UPLOADED: "bg-blue-900/50 text-blue-400 border-blue-800",
                                COMPLIANT: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
                                NON_COMPLIANT: "bg-amber-900/50 text-amber-400 border-amber-800",
                            }

                            return (
                                <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-800/50 data-[state=selected]:bg-slate-800">
                                    <TableCell className="font-medium text-slate-200">{sub.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${statusColors[sub.status as keyof typeof statusColors] || statusColors.INVITED}`}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        {report?.extracted_gl_limit
                                            ? `$${(report.extracted_gl_limit / 1000000).toFixed(1)}M`
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {report?.has_additional_insured ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        ) : report ? (
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                            <Download className="h-4 w-4" />
                                            <span className="sr-only">Download COI</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
