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

export function CreateJobPostingModal() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        const res = await createJobPosting(formData)
        setIsSubmitting(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Job posting created successfully!")
            setOpen(false)
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

                <form action={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-300">Job Title</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Master Electrician needed for Highrise"
                            className="bg-slate-950 border-slate-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry_focus" className="text-slate-300">Industry / Trade Focus</Label>
                        <Input
                            id="industry_focus"
                            name="industry_focus"
                            required
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
