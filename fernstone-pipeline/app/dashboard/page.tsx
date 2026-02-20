
import { ProjectList } from "@/components/ProjectList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("gc_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Projects</h1>
                    <p className="text-slate-400">Manage your projects and compliance requirements.</p>
                </div>
                <CreateProjectModal />
            </div>

            <ProjectList projects={projects || []} />
        </div>
    );
}
