
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, ArrowRight, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.avif"
                alt="Fernstone Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-serif font-medium tracking-tight text-white/90">Fernstone</span>
          </div>
          <nav>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
                GC Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center space-y-12">

        {/* Hero Section */}
        <div className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Compliance Automation
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-white leading-tight">
            Compliance to Commerce <span className="text-primary italic">Pipeline</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            The automated insurance verification platform that bridges coverage gaps instantly.
            General Contractors invite, we verify, and AI fixes the rest.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Enter GC Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="h-14 px-8 text-base border-white/10 hover:bg-white/5 text-white rounded-lg backdrop-blur-sm transition-all">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Value Props / Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-12 text-left">
          <Card className="bg-card border-white/5 shadow-2xl">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-primary font-bold text-xl font-serif">1</div>
              <h3 className="text-xl font-serif font-medium text-white">Invite & Onboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                GCs create projects and invite subcontractors via magic links. No friction onboarding.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5 shadow-2xl">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-primary font-bold text-xl font-serif">2</div>
              <h3 className="text-xl font-serif font-medium text-white">AI Verification</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI extracts data from ACORD 25 forms and validates against specific project requirements.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5 shadow-2xl">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-primary font-bold text-xl font-serif">3</div>
              <h3 className="text-xl font-serif font-medium text-white">Bridge the Gap</h3>
              <p className="text-muted-foreground leading-relaxed">
                Coverage gaps are detected and fixed instantly with one-click upsells.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-background py-8 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Fernstone Inc. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
