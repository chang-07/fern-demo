import { UserProfileMenu } from "@/components/UserProfileMenu";
import Image from "next/image";

export default function SubcontractorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <nav className="border-b border-border bg-background/50 backdrop-blur-md p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/logo.avif"
                                alt="Fernstone Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Fernstone</span>
                        <span className="text-sm font-medium text-emerald-500 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            Subcontractor
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6">
                            <a href="/subcontractor" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</a>
                            <a href="/subcontractor/market/jobs" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Job Board</a>
                            <a href="/subcontractor/market" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Directory</a>
                            <a href="/subcontractor/profile" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Profile</a>
                        </div>
                        <UserProfileMenu />
                    </div>
                </div>
            </nav>
            <main className="p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
