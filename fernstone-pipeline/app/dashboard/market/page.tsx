import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MarketplaceClient } from "@/components/MarketplaceClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateJobPostingModal } from "@/components/CreateJobPostingModal"
import { DeleteJobPostingButton } from "@/components/DeleteJobPostingButton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Building2, Users } from "lucide-react"

export default async function MarketPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/login");
    }

    // 1. Fetch Subcontractor Profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            company_name,
            industry,
            description,
            role,
            gl_limit,
            auto_limit,
            wc_limit,
            umbrella_limit,
            has_additional_insured,
            expiry_date
        `)
        .eq('role', 'SUBCONTRACTOR')
        .order('created_at', { ascending: false });

    if (profilesError) console.error("Error fetching market data:", profilesError);

    const processedSubs = (profiles || []).map(profile => ({
        id: profile.id,
        company_name: profile.company_name,
        industry: profile.industry,
        description: profile.description,
        email: profile.email,
        status: profile.gl_limit ? 'VERIFIED' : 'REGISTERED',
        projects: null,
        compliance_reports: [{
            extracted_gl_limit: profile.gl_limit,
            extracted_auto_limit: profile.auto_limit,
            extracted_wc_limit: profile.wc_limit,
            extracted_umbrella_limit: profile.umbrella_limit,
            has_additional_insured: profile.has_additional_insured,
            expiry_date: profile.expiry_date,
            is_compliant: true,
            deficiencies: []
        }]
    }));

    // 2. Fetch GC's Job Postings
    const { data: postings } = await supabase
        .from('job_postings')
        .select('*')
        .eq('gc_id', user.id)
        .order('created_at', { ascending: false })

    // 3. Fetch GC's Projects (for the Create Job Modal dropdown)
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('gc_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Marketplace</h1>
                <p className="text-slate-400">
                    Discover compliant subcontractors or broadcast your project needs to the network.
                </p>
            </div>

            <Tabs defaultValue="network" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 p-1 mb-6">
                    <TabsTrigger value="network" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                        <Users className="w-4 h-4 mr-2" />
                        Subcontractor Network
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                        <Briefcase className="w-4 h-4 mr-2" />
                        My Job Postings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="network" className="mt-0 outline-none">
                    <MarketplaceClient initialSubcontractors={processedSubs} />
                </TabsContent>

                <TabsContent value="jobs" className="mt-0 outline-none space-y-6">
                    <div className="flex justify-end">
                        <CreateJobPostingModal projects={projects || []} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!postings || postings.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/20 border border-slate-800 border-dashed rounded-xl">
                                <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                                <h3 className="text-lg font-medium text-slate-400">No Job Postings</h3>
                                <p className="mt-1">You haven't broadcasted any jobs to the market yet.</p>
                            </div>
                        ) : (
                            postings.map((job) => (
                                <Card key={job.id} className="bg-slate-900/50 border-slate-800 flex flex-col relative">
                                    <div className="absolute top-4 right-4 z-10">
                                        <DeleteJobPostingButton postingId={job.id} />
                                    </div>
                                    <CardHeader className="pb-4 pr-12">
                                        <div className="flex flex-wrap gap-2 items-start mb-2">
                                            <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                                                <Building2 className="h-3 w-3 mr-1" />
                                                {job.industry_focus}
                                            </Badge>
                                            <Badge className={
                                                job.status === 'OPEN'
                                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                            }>
                                                {job.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                                        <CardDescription className="text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                                            {job.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto pt-4 border-t border-slate-800/50">
                                        <div className="flex items-center text-xs text-slate-500">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
