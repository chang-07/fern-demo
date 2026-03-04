"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { approveSubcontractor } from "@/actions/approve-subcontractor"
import { Check } from "lucide-react"

export function ApproveSubcontractorButton({ subcontractorId, onApprove }: { subcontractorId: string, onApprove?: (result: any) => void }) {
    const [loading, setLoading] = useState(false)

    const handleApprove = async (e: React.MouseEvent) => {
        // Prevent click from bubbling up to the row (which might open a modal in the future)
        e.stopPropagation()
        console.log('[APPROVE BUTTON] Clicked for:', subcontractorId)

        setLoading(true)
        try {
            console.log('[APPROVE BUTTON] Calling action...')
            const result = await approveSubcontractor(subcontractorId)
            console.log('[APPROVE BUTTON] Action returned:', result)
            if (result?.error) {
                console.log('[APPROVE BUTTON] Error result')
                toast.error(result.error)
            } else {
                console.log('[APPROVE BUTTON] Success result')
                toast.success("Subcontractor approved successfully.")
                onApprove?.(result)
            }
        } catch (error: any) {
            console.error('[APPROVE BUTTON] Caught error:', error)
            toast.error("An unexpected error occurred: " + error?.message)
        } finally {
            console.log('[APPROVE BUTTON] Finally block reached')
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
        >
            {loading ? (
                <span className="flex items-center gap-1">Approving...</span>
            ) : (
                <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Approve</span>
            )}
        </Button>
    )
}
