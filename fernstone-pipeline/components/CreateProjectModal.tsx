"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function CreateProjectModal() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Using server action without explicit import for now, 
        // or we can fetch/POST to an API route. 
        // Given we are client component, we'd normally import the server action. 
        // But dynamic imports are tricky without full module setup sometimes.
        // I'll assume we can import the action.
        try {
            const { createProject } = await import("@/actions/create-project")
            const formData = new FormData()
            formData.append("name", name)
            // Default requirements for MVP
            formData.append("req_gl_occurrence", "2000000")
            formData.append("req_additional_insured", "on")

            const result = await createProject(formData)
            if (result?.error) {
                console.error(result.error)
                // Show toast error
            } else {
                setOpen(false)
                setName("")
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Add a new project to start tracking insurance compliance.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-slate-300">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3 bg-slate-800 border-slate-700 text-white"
                            required
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
                        {loading ? "Creating..." : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
