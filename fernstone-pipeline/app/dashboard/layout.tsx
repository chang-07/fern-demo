import Image from "next/image";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { GlobalCelebration } from "@/components/GlobalCelebration";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

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

    // Fetch unread messages count
    let unreadCount = 0;
    if (user) {
        const { count } = await (supabase as any)
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        unreadCount = count || 0;
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <nav className="border-b border-border bg-background/50 backdrop-blur-md p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 -mt-1">
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
                            <a href="/dashboard/market" className="hover:text-white transition-colors">Marketplace</a>
                            <a href="/dashboard/inbox" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                                Inbox
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-1 h-5 px-1.5 flex items-center justify-center text-[10px] leading-none">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </a>
                        </div>
                    </div>
                    <UserProfileMenu />
                </div>
            </nav>
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
            <GlobalCelebration />
        </div>
    );
}
