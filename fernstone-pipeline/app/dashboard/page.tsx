import { ProjectList } from "@/components/ProjectList";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { SeedDataButton } from "@/components/SeedDataButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileCheck, ShieldAlert, FolderKanban } from "lucide-react";
import { DashboardCandidatesList } from "@/components/DashboardCandidatesList";

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
            projects (name, req_gl_occurrence, status),
            compliance_reports (
                is_compliant, deficiencies, extracted_gl_limit
            )
        `)
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

    const subs = subcontractors || [];

    // Aggregates
    const totalSubs = subs.length;
    const compliantSubs = subs.filter(s => s.status === 'COMPLIANT' && (s.projects as any)?.status !== 'CLOSED');
    const nonCompliantSubs = subs.filter(s => s.status === 'NON_COMPLIANT' && (s.projects as any)?.status !== 'CLOSED');
    const complianceRate = totalSubs > 0 ? Math.round((compliantSubs.length / totalSubs) * 100) : 0;

    const projectsWithCounts = projects?.map(p => ({
        ...p,
        subcontractorCount: subs.filter(s => s.project_id === p.id).length
    })) || [];

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
                <DashboardCandidatesList
                    initialCompliantSubs={compliantSubs}
                    initialNonCompliantSubs={nonCompliantSubs}
                />

                {/* Right Column: Projects */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-4">Project Portfolios</h2>
                        <ProjectList projects={projectsWithCounts} />
                    </div>
                </div>
            </div>

        </div>
    );
}
