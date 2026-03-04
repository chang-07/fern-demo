import { UserProfileMenu } from "@/components/UserProfileMenu";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function SubcontractorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let unreadCount = 0;
    if (user) {
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profile) {
            const { count } = await (supabase as any)
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', profile.id)
                .eq('is_read', false);

            unreadCount = count || 0;
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <nav className="border-b border-border bg-background/50 backdrop-blur-md p-4">
                <div className="container mx-auto flex items-center justify-between">
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
                        <span className="text-sm font-medium text-emerald-500 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            Subcontractor
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6">
                            <a href="/subcontractor" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</a>
                            <a href="/subcontractor/market" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Marketplace</a>
                            <a href="/subcontractor/inbox" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                Inbox
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-1 h-5 px-1.5 flex items-center justify-center text-[10px] leading-none">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </a>
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
