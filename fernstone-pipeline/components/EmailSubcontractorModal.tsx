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
import { sendEmailToSubcontractor } from "@/actions/send-email"

interface EmailSubcontractorModalProps {
    subcontractorId: string
    subcontractorEmail: string
}

export function EmailSubcontractorModal({ subcontractorId, subcontractorEmail }: EmailSubcontractorModalProps) {
    const [open, setOpen] = useState(false)
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await sendEmailToSubcontractor(subcontractorId, subject, message)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(`Email sent to ${subcontractorEmail}`)
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white" title="Email Subcontractor">
                    <Mail className="h-4 w-4" />
                    <span className="sr-only">Email Subcontractor</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle>Email {subcontractorEmail}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Send a message directly to this subcontractor. They can reply to your email address.
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
                            placeholder="Regarding insurance requirements..."
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
                            placeholder="Type your message here..."
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            {loading ? "Sending..." : (
                                <>
                                    <Send className="h-3 w-3" /> Send Email
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
