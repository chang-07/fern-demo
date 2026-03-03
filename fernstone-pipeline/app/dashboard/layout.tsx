import Image from "next/image";
import { UserProfileMenu } from "@/components/UserProfileMenu";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'SUBCONTRACTOR') {
            redirect('/subcontractor');
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <nav className="border-b border-border bg-background/50 backdrop-blur-md p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
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
                        </div>

                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
                            <a href="/dashboard/market" className="hover:text-white transition-colors">Market</a>
                            <a href="/dashboard/postings" className="hover:text-white transition-colors">Job Postings</a>
                        </div>
                    </div>
                    <UserProfileMenu />
                </div>
            </nav>
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
