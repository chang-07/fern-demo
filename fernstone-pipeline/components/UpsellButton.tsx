"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { notifySales } from "@/actions/notify-sales"
import { toast } from "sonner"
import { Zap } from "lucide-react"

export function UpsellButton({ subcontractorId }: { subcontractorId: string }) {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleClick = async () => {
        setLoading(true)
        try {
            const result = await notifySales(subcontractorId)
            if (result.error) {
                toast.error(result.error)
            } else {
                setSent(true)
                toast.success("Request sent! A Fernstone agent will contact you shortly.")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="w-full py-3 px-4 bg-emerald-900/40 text-emerald-400 rounded-md font-medium text-center border border-emerald-800">
                Request Received. We're on it!
            </div>
        )
    }

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-900/20"
        >
            {loading ? "Processing..." : (
                <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 fill-current" />
                    Fix Coverage Instantly (~$300)
                </span>
            )}
        </Button>
    )
}
