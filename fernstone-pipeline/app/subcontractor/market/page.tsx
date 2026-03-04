import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { GCDirectoryClient } from "@/components/GCDirectoryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobPostingCard } from "@/components/JobPostingCard"
import { Briefcase, Users } from "lucide-react"

export default async function SubcontractorMarketPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/login");
    }

    // 1. Fetch GC Profiles (for the Directory tab)
    const { data: gcProfiles, error: gcError } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            company_name,
            industry,
            description,
            role
        `)
        .eq('role', 'GC')
        .order('created_at', { ascending: false });

    if (gcError) console.error("Error fetching GC data:", gcError);

    // Map GCs to a format the existing MarketplaceClient accepts 
    // Usually MarketplaceClient shows subs, we can adapt it or just render a simple list
    // But since it's generic enough (name, industry, description), we'll reuse it for now.
    const processedGCs = (gcProfiles || []).map(profile => ({
        id: profile.id,
        company_name: profile.company_name,
        industry: profile.industry,
        description: profile.description,
        email: profile.email,
        status: 'VERIFIED',
        projects: null,
        compliance_reports: []
    }));

    // 2. Fetch OPEN job postings and their linked project requirements (for the Job Board tab)
    const { data: postings } = await supabase
        .from('job_postings')
        .select(`
            *,
            project:projects(id, name, req_gl_occurrence, req_auto_limit, req_wc_limit, req_umbrella_limit, req_additional_insured)
        `)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })

    // 3. Fetch the Subcontractor's own generic coverage limits
    const { data: myProfile } = await supabase
        .from('profiles')
        .select('id, gl_limit, auto_limit, wc_limit, umbrella_limit, has_additional_insured')
        .eq('id', user.id)
        .single()

    // Create a dictionary of GCs for the Job Postings to look up names
    let profilesByGcId: Record<string, any> = {}
    gcProfiles?.forEach(p => {
        profilesByGcId[p.id] = p
    })

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Marketplace</h1>
                <p className="text-slate-400">
                    Find job opportunities or explore our network of General Contractors.
                </p>
            </div>

            <Tabs defaultValue="jobs" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 p-1 mb-6">
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Job Board
                    </TabsTrigger>
                    <TabsTrigger value="network" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                        <Users className="w-4 h-4 mr-2" />
                        GC Directory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="mt-0 outline-none space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!postings || postings.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/20 border border-slate-800 border-dashed rounded-xl">
                                <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                                <h3 className="text-lg font-medium text-slate-400">No Open Jobs</h3>
                                <p className="mt-1">Check back later for new opportunities from our GC network.</p>
                            </div>
                        ) : (
                            postings.map((job) => {
                                // Since we used select('*, project:projects(...)'), 
                                // it will always be under job.project
                                const linkedProject = job.project;
                                return (
                                    <JobPostingCard
                                        key={job.id}
                                        job={job}
                                        gc={profilesByGcId[job.gc_id]}
                                        project={linkedProject}
                                        profileLimits={myProfile}
                                    />
                                );
                            })
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="network" className="mt-0 outline-none">
                    <GCDirectoryClient initialGCs={processedGCs} subcontractorId={myProfile?.id || ''} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
