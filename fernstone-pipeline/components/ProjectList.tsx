"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users } from "lucide-react"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"

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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
            {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors group cursor-pointer h-full">
                        <CardHeader className="flex flex-col items-start justify-between space-y-2 pb-2">
                            <div className="flex w-full justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-semibold text-slate-200 leading-tight flex items-center gap-2">
                                        {project.name}
                                        {project.status === 'CLOSED' && (
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 border-slate-700 h-5 px-1.5">
                                                Closed
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400 mt-1">
                                        Coverage: ${(project.req_gl_occurrence || 0) / 1000000}M GL / ${(project.requirements?.gl?.aggregate || 0) / 1000000}M Agg
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                        <DeleteProjectButton projectId={project.id} />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{project.subcontractorCount || 0}</div>
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
