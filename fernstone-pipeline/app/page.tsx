
import Link from "next/link"
import { ShieldCheck, ArrowRight, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Fernstone</span>
          </div>
          <nav>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                GC Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Compliance to Commerce <span className="text-emerald-500">Pipeline</span>
          </h1>
          <p className="text-lg text-slate-400">
            The automated insurance verification platform that bridges coverage gaps instantly.
            General Contractors invite, we verify, and AI fixes the rest.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Enter GC Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-lg mb-2 text-white">1. Invite</h3>
            <p className="text-slate-400 text-sm">GCs create projects and invite subcontractors via magic links.</p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-lg mb-2 text-white">2. Verify</h3>
            <p className="text-slate-400 text-sm">AI extracts data from ACORD 25 forms and checks against project requirements.</p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-lg mb-2 text-white">3. Bridge</h3>
            <p className="text-slate-400 text-sm">Coverage gaps are detected and fixed instantly with one-click upsells.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-600 text-sm">
        &copy; 2026 Fernstone Inc. All rights reserved.
      </footer>
    </div>
  )
}
