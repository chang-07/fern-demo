import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { CreateJobPostingModal } from "@/components/CreateJobPostingModal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Building2 } from "lucide-react"

export default async function GCPoostingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect("/login")
    }

    // Auth layer checks this is a GC already (via layout), 
    // but we can query their postings:
    const { data: postings } = await supabase
        .from('job_postings')
        .select('*')
        .eq('gc_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Job Postings</h1>
                    <p className="text-slate-400 mt-1">
                        Broadcast opportunities to the Subcontractor Market.
                    </p>
                </div>
                <div className="flex gap-3">
                    <CreateJobPostingModal />
                </div>
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
                        <Card key={job.id} className="bg-slate-900/50 border-slate-800">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
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
        </div>
    )
}
