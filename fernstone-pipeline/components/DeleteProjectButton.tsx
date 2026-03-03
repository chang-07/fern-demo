"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteProject } from "@/actions/delete-project"

export function DeleteProjectButton({ projectId }: { projectId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        // Prevent the click from bubbling up to the Link component wrapping the Card
        e.preventDefault()
        e.stopPropagation()

        if (!confirm("Are you sure you want to delete this project? This will also remove any job postings linked to it. This cannot be undone.")) return

        setIsDeleting(true)
        const res = await deleteProject(projectId)
        setIsDeleting(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Project deleted!")
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors z-10"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
