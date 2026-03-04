"use client"

import { useEffect, useState } from "react"
import { ProjectClosedCelebration } from "./ProjectClosedCelebration"

export function GlobalCelebration() {
    const [celebration, setCelebration] = useState({ open: false, projectName: "" })

    useEffect(() => {
        const handleCelebrate = (e: any) => {
            setCelebration({ open: true, projectName: e.detail })
        }
        window.addEventListener('project-closed', handleCelebrate)
        return () => window.removeEventListener('project-closed', handleCelebrate)
    }, [])

    return (
        <ProjectClosedCelebration
            open={celebration.open}
            onOpenChange={(open) => setCelebration({ ...celebration, open })}
            projectName={celebration.projectName}
        />
    )
}
