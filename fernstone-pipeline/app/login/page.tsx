"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { login, signup } from './actions'
import { ShieldCheck, AlertCircle, Building2, HardHat, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const [selectedRole, setSelectedRole] = useState<'GC' | 'SUBCONTRACTOR'>('GC')

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
            {/* Left Side: Branding & Imagery */}
            <div className="relative hidden md:flex w-full md:w-1/2 bg-slate-900 border-r border-slate-800 items-center justify-center p-12 overflow-hidden">
                {/* Architectural / Mesh Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-emerald-900"></div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="relative z-10 w-full max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="relative h-12 w-12 -mt-1">
                                <Image
                                    src="/logo.avif"
                                    alt="Fernstone Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-4xl font-bold tracking-tight text-white">Fernstone</span>
                        </div>
                        <h1 className="text-4xl font-serif text-slate-200 leading-tight mb-4">
                            Compliance-to-Commerce for Construction
                        </h1>
                        <p className="text-lg text-slate-400">
                            The intelligent marketplace connecting General Contractors with verified, risk-free Subcontractors.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                {/* Mobile Logo Logo */}
                <div className="absolute top-8 left-8 flex md:hidden items-center gap-2">
                    <div className="relative h-8 w-8 -mt-1">
                        <Image src="/logo.avif" alt="Fernstone Logo" fill className="object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Fernstone</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
                        <p className="text-slate-400">Enter your credentials to access your dashboard.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <form className="space-y-6">
                        {/* Interactive Role Selection */}
                        <div className="space-y-3">
                            <Label className="text-slate-300">I am a...</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Hidden inputs to capture the value for form submission */}
                                <input type="hidden" name="role" value={selectedRole} />

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('GC')}
                                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col items-start gap-2 ${selectedRole === 'GC'
                                            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <Building2 className={`w-6 h-6 ${selectedRole === 'GC' ? 'text-blue-500' : 'text-slate-500'}`} />
                                    <span className={`font-medium ${selectedRole === 'GC' ? 'text-white' : 'text-slate-400'}`}>General Contractor</span>
                                    {selectedRole === 'GC' && (
                                        <motion.div layoutId="role-indicator" className="absolute inset-0 rounded-xl border-2 border-blue-500" transition={{ duration: 0.2 }} />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('SUBCONTRACTOR')}
                                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col items-start gap-2 ${selectedRole === 'SUBCONTRACTOR'
                                            ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <HardHat className={`w-6 h-6 ${selectedRole === 'SUBCONTRACTOR' ? 'text-emerald-500' : 'text-slate-500'}`} />
                                    <span className={`font-medium ${selectedRole === 'SUBCONTRACTOR' ? 'text-white' : 'text-slate-400'}`}>Subcontractor</span>
                                    {selectedRole === 'SUBCONTRACTOR' && (
                                        <motion.div layoutId="role-indicator" className="absolute inset-0 rounded-xl border-2 border-emerald-500" transition={{ duration: 0.2 }} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    className="h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="h-12 bg-slate-900/50 border-slate-800 text-white focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                formAction={login}
                                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg shadow-blue-900/20 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-950 px-2 text-slate-500">Or</span>
                                </div>
                            </div>

                            <Button
                                formAction={signup}
                                variant="outline"
                                className="h-12 w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                Create an Account
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
