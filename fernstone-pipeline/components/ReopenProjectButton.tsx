"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { reopenProject } from "@/actions/reopen-project"
import { Play } from "lucide-react"

export function ReopenProjectButton({ projectId }: { projectId: string }) {
    const [loading, setLoading] = useState(false)

    const handleReopen = async () => {
        setLoading(true)
        try {
            const result = await reopenProject(projectId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Project reopened successfully.")
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            onClick={handleReopen}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
            {loading ? (
                <span className="flex items-center gap-1">Reopening...</span>
            ) : (
                <span className="flex items-center gap-1"><Play className="w-4 h-4" /> Reopen Project</span>
            )}
        </Button>
    )
}
