import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Building2, ExternalLink } from "lucide-react"

export default async function SubcontractorJobBoard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect("/login")
    }

    // Fetch OPEN job postings
    const { data: postings } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })

    // Supabase JS join types for auth are tricky because it's a restricted schema
    // Let's do a separate fetch for the GC profiles to get their company names
    const gcIds = postings?.map(p => p.gc_id) || []

    let profilesByGcId: Record<string, any> = {}
    if (gcIds.length > 0) {
        const { data: gcProfiles } = await supabase
            .from('profiles')
            .select('id, company_name, email')
            .in('id', gcIds)

        gcProfiles?.forEach(p => {
            profilesByGcId[p.id] = p
        })
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Job Board</h1>
                    <p className="text-slate-400 mt-1">
                        Find active project opportunities from verified General Contractors.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!postings || postings.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/20 border border-slate-800 border-dashed rounded-xl">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                        <h3 className="text-lg font-medium text-slate-400">No Open Jobs</h3>
                        <p className="mt-1">Check back later for new opportunities from our GC network.</p>
                    </div>
                ) : (
                    postings.map((job) => {
                        const gc = profilesByGcId[job.gc_id]
                        return (
                            <Card key={job.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-600 transition-colors group cursor-pointer flex flex-col">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                                            <Building2 className="h-3 w-3 mr-1" />
                                            {job.industry_focus}
                                        </Badge>
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                            New
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors flex justify-between items-start">
                                        {job.title}
                                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 ml-2 text-blue-500" />
                                    </CardTitle>
                                    <div className="text-xs text-slate-500 mt-1 font-medium">
                                        Posted by <span className="text-slate-300">{gc?.company_name || gc?.email || 'A General Contractor'}</span>
                                    </div>
                                    <CardDescription className="text-slate-400 line-clamp-3 mt-3 leading-relaxed">
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
                        )
                    })
                )}
            </div>
        </div>
    )
}
