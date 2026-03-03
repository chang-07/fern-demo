"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteJobPosting } from "@/actions/delete-job-posting"

export function DeleteJobPostingButton({ postingId }: { postingId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job posting? This cannot be undone.")) return

        setIsDeleting(true)
        const res = await deleteJobPosting(postingId)
        setIsDeleting(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Job posting deleted!")
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
