"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PartyPopper } from "lucide-react"

export function ProjectClosedCelebration({ open, onOpenChange, projectName }: { open: boolean, onOpenChange: (open: boolean) => void, projectName?: string }) {
    const { width, height } = useWindowSize()
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (open) {
            setShowConfetti(true)
            // Stop generating new confetti after 5 seconds to let them fall out naturally
            const timer = setTimeout(() => setShowConfetti(false), 5000)
            return () => clearTimeout(timer)
        } else {
            setShowConfetti(false)
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 p-0 overflow-hidden">
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-50">
                        <Confetti
                            width={width}
                            height={height}
                            recycle={false}
                            numberOfPieces={500}
                            gravity={0.15}
                        />
                    </div>
                )}
                <div className="p-8 text-center space-y-6 relative z-10">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                        <PartyPopper className="w-8 h-8 text-emerald-400" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white text-center">Project Complete!</DialogTitle>
                    </DialogHeader>
                    <div className="text-slate-300">
                        <p className="mb-2">Congratulations!</p>
                        <p>All required subcontractors for <strong className="text-white">{projectName || "this project"}</strong> are now compliant and approved.</p>
                        <p className="mt-4 text-sm text-slate-400">The project status has been updated to <strong className="text-slate-300">CLOSED</strong>.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
