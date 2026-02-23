import Image from "next/image";

export default function DashboardLayout({
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
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">GC Portal</span>
                        <div className="h-8 w-8 rounded-full bg-slate-800" />
                    </div>
                </div>
            </nav>
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
