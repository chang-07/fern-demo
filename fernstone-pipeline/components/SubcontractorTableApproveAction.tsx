"use client"

import { useState } from "react"
import { ApproveSubcontractorButton } from "@/components/ApproveSubcontractorButton"
import { ProjectClosedCelebration } from "@/components/ProjectClosedCelebration"
import { useRouter } from "next/navigation"

export function SubcontractorTableApproveAction({ subcontractorId, projectName }: { subcontractorId: string, projectName?: string }) {
    const [celebration, setCelebration] = useState({ open: false, projectName: "" })
    const router = useRouter()

    return (
        <>
            <ApproveSubcontractorButton
                subcontractorId={subcontractorId}
                onApprove={(result: any) => {
                    if (result?.projectClosed) {
                        setCelebration({ open: true, projectName: result.projectName || projectName })
                    } else {
                        // Just refresh the page to get the new status
                        router.refresh()
                    }
                }}
            />
            <ProjectClosedCelebration
                open={celebration.open}
                onOpenChange={(open) => {
                    setCelebration({ ...celebration, open })
                    if (!open) {
                        router.refresh()
                    }
                }}
                projectName={celebration.projectName}
            />
        </>
    )
}
