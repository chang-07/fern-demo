import { ProjectList } from "@/components/ProjectList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/CreateProjectModal";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Projects</h1>
                    <p className="text-slate-400">Manage your projects and compliance requirements.</p>
                </div>
                <CreateProjectModal />
            </div>

            <ProjectList />
        </div>
    );
}
