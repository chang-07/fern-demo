"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send } from "lucide-react"
import { toast } from "sonner"
import { contactGC } from "@/actions/contact-gc"

interface ContactGCModalProps {
    subcontractorId: string
    projectName: string
}

export function ContactGCModal({ subcontractorId, projectName }: ContactGCModalProps) {
    const [open, setOpen] = useState(false)
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await contactGC(subcontractorId, subject, message)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Message sent to General Contractor")
                setOpen(false)
                setSubject("")
                setMessage("")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-2">
                    <Mail className="h-4 w-4" /> Contact GC
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle>Contact {projectName} Team</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Have a question about the insurance requirements? Send a message to the General Contractor.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject" className="text-slate-300">
                            Subject
                        </Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Question about limits..."
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message" className="text-slate-300">
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                            placeholder="Type your question here..."
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                            {loading ? "Sending..." : (
                                <>
                                    <Send className="h-3 w-3" /> Send Message
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
