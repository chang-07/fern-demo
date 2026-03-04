"use client"

import { ApproveSubcontractorButton } from "@/components/ApproveSubcontractorButton"
import { useRouter } from "next/navigation"

export function SubcontractorTableApproveAction({ subcontractorId, projectName }: { subcontractorId: string, projectName?: string }) {
    const router = useRouter()

    return (
        <ApproveSubcontractorButton
            subcontractorId={subcontractorId}
            onApprove={(result: any) => {
                if (result?.projectClosed) {
                    window.dispatchEvent(new CustomEvent('project-closed', { detail: result.projectName || projectName }))
                }
                // Always refresh the page to get the new status
                router.refresh()
            }}
        />
    )
}
