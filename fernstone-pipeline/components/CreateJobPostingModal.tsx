"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { createJobPosting } from "@/actions/create-job-posting"
import { toast } from "sonner"

interface Project {
    id: string;
    name: string;
}

export function CreateJobPostingModal({ projects }: { projects: Project[] }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [industryFocus, setIndustryFocus] = useState("")
    const [projectId, setProjectId] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('industry_focus', industryFocus)
        if (projectId) {
            formData.append('project_id', projectId)
        }

        const res = await createJobPosting(formData)
        setIsSubmitting(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Job posting created successfully!")
            setOpen(false)
            // Reset state
            setTitle("")
            setDescription("")
            setIndustryFocus("")
            setProjectId("")
        }
    }

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setProjectId(selectedId);

        if (selectedId) {
            const project = projects.find(p => p.id === selectedId);
            if (project) {
                // Auto-fill title if empty
                if (!title) setTitle(`Need Subcontractors for ${project.name}`);
                // Auto-fill description if empty (we don't have full description in the project prop right now, 
                // but we can put a placeholder based on the name)
                if (!description) setDescription(`We are looking for verified subcontractors to assist us on the ${project.name} project. Please ensure your insurance limits meet the project requirements before applying.`);
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-900/20">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Job Posting
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">New Job Posting</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-300">Job Title</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Master Electrician needed for Highrise"
                            className="bg-slate-950 border-slate-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="project_id" className="text-slate-300">Link to Project (Optional)</Label>
                        <select
                            id="project_id"
                            name="project_id"
                            value={projectId}
                            onChange={handleProjectChange}
                            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">No Project (General Posting)</option>
                            {projects && projects.length > 0 ? (
                                projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No active projects found</option>
                            )}
                        </select>
                        <p className="text-xs text-slate-500">Linking a project allows subcontractors to instantly check if they meet your insurance requirements.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry_focus" className="text-slate-300">Industry / Trade Focus</Label>
                        <Input
                            id="industry_focus"
                            name="industry_focus"
                            required
                            value={industryFocus}
                            onChange={e => setIndustryFocus(e.target.value)}
                            placeholder="e.g. Electrical, Plumbing, Roofing..."
                            className="bg-slate-950 border-slate-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the scope of work, timeline, and requirements..."
                            className="bg-slate-950 border-slate-800 text-white min-h-[100px]"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSubmitting ? "Posting..." : "Post Job"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
