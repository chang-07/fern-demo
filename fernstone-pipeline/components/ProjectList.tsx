
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users } from "lucide-react"

export async function ProjectList() {
    const supabase = await createClient()

    // Get current user to filter
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-center text-slate-400">
                    Please sign in to view projects.
                </CardContent>
            </Card>
        )
    }

    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("gc_id", user.id)
        .order("created_at", { ascending: false })

    if (!projects?.length) {
        return (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
                <h3 className="text-lg font-medium text-slate-200">No projects found</h3>
                <p className="text-slate-500 mt-1">Get started by creating a new project.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors group cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">
                                {project.name}
                            </CardTitle>
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white mb-1">
                                {/* Placeholder for stats - would require join/count query */}
                                0
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Subcontractors
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                                <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px] group-hover:border-emerald-500/30 group-hover:text-emerald-400">
                                    Active
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
