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
import { Mail } from "lucide-react"
import { inviteSubcontractor } from "@/actions/invite-subcontractor"
import { toast } from "sonner"

export function InviteSubcontractorModal({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("projectId", projectId)
        formData.append("email", email)

        try {
            const result = await inviteSubcontractor(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Invitation sent successfully")
                setOpen(false)
                setEmail("")
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                    <Mail className="h-4 w-4" /> Invite Subcontractor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle>Invite Subcontractor</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Send an email invitation to verify insurance compliance.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-slate-300">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3 bg-slate-800 border-slate-700 text-white"
                            required
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
                        {loading ? "Sending..." : "Send Invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
