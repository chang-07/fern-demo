
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users } from "lucide-react"

export function ProjectList({ projects }: { projects: any[] }) {
    if (!projects || projects.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-center text-slate-400">
                    No projects found. Create one to get started.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors group cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium text-slate-200">
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-400 mt-1">
                                    Coverage: ${(project.req_gl_occurrence || 0) / 1000000}M GL / ${(project.requirements?.gl?.aggregate || 0) / 1000000}M Agg
                                </CardDescription>
                            </div>
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">0</div>
                            <p className="text-xs text-slate-400 flex items-center mt-1">
                                <Users className="w-3 h-3 mr-1" />
                                Subcontractors
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
