import { ProjectList } from "@/components/ProjectList";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { SeedDataButton } from "@/components/SeedDataButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileCheck, ShieldAlert, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApproveSubcontractorButton } from "@/components/ApproveSubcontractorButton";
import { SubcontractorDetailModal } from "@/components/SubcontractorDetailModal";
import { SendReminderButton } from "@/components/SendReminderButton";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role === 'SUBCONTRACTOR') {
        return redirect('/subcontractor');
    }

    // Fetch projects
    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("gc_id", user.id)
        .order("created_at", { ascending: false });

    const projectIds = projects?.map(p => p.id) || [];

    // Fetch all subcontractors for these projects to aggregate data
    const { data: subcontractors } = await supabase
        .from("subcontractors")
        .select(`
            id, email, status, project_id,
            projects (name, req_gl_occurrence),
            compliance_reports (
                is_compliant, deficiencies, extracted_gl_limit
            )
        `)
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

    const subs = subcontractors || [];

    // Aggregates
    const totalSubs = subs.length;
    const compliantSubs = subs.filter(s => s.status === 'COMPLIANT');
    const nonCompliantSubs = subs.filter(s => s.status === 'NON_COMPLIANT');
    const complianceRate = totalSubs > 0 ? Math.round((compliantSubs.length / totalSubs) * 100) : 0;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Manage project compliance and approve ready contractors.</p>
                </div>
                <div className="flex gap-3">
                    <SeedDataButton />
                    <CreateProjectModal />
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 hover:-translate-y-1 hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white tracking-tight">{projects?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 hover:-translate-y-1 hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Network Contractors</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white tracking-tight">{totalSubs}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-emerald-900/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Ready to Approve</CardTitle>
                        <FileCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-400 tracking-tight">{compliantSubs.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-blue-900/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Compliance Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                                {complianceRate}%
                            </div>
                        </div>
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800/50">
                            <div
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${complianceRate > 80 ? 'bg-emerald-500' : complianceRate > 50 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${complianceRate}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Actionable Lists */}
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
                            {compliantSubs.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">No compliant candidates available yet.</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {compliantSubs.map((sub: any) => {
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
                                                    <ApproveSubcontractorButton subcontractorId={sub.id} />
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
                            {nonCompliantSubs.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">All uploaded documents meet requirements.</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {nonCompliantSubs.map((sub: any) => {
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

                {/* Right Column: Projects */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-4">Project Portfolios</h2>
                        <ProjectList projects={projects || []} />
                    </div>
                </div>
            </div>

        </div>
    );
}
