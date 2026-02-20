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
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import { createProject } from "@/actions/create-project"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function CreateProjectModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await createProject(formData)

            if (result?.error) {
                alert(result.error)
            } else {
                setOpen(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert("Failed to create project")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col bg-card border-border text-card-foreground p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Configure project details and compliance requirements.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        <form id="create-project-form" onSubmit={handleSubmit} className="space-y-8 p-6">
                            {/* Project Info */}
                            <div className="grid gap-4">
                                <Label htmlFor="name" className="text-base font-semibold">Project Information</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Project Name (e.g. Westside Office Complex)"
                                    required
                                />
                            </div>

                            <Separator className="bg-border" />

                            {/* General Liability */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold text-primary">General Liability</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="gl_occurrence" className="text-xs text-muted-foreground uppercase">Each Occurrence</Label>
                                        <Input id="gl_occurrence" name="gl_occurrence" type="number" defaultValue="1000000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gl_aggregate" className="text-xs text-muted-foreground uppercase">General Aggregate</Label>
                                        <Input id="gl_aggregate" name="gl_aggregate" type="number" defaultValue="2000000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gl_products" className="text-xs text-muted-foreground uppercase">Products - Comp/Op Agg</Label>
                                        <Input id="gl_products" name="gl_products" type="number" defaultValue="2000000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gl_personal" className="text-xs text-muted-foreground uppercase">Personal & Adv Injury</Label>
                                        <Input id="gl_personal" name="gl_personal" type="number" defaultValue="1000000" />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Auto Liability */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold text-primary">Automobile Liability</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2 col-span-2">
                                        <Label htmlFor="auto_csl" className="text-xs text-muted-foreground uppercase">Combined Single Limit (CSL)</Label>
                                        <Input id="auto_csl" name="auto_csl" type="number" defaultValue="1000000" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="auto_any" name="auto_any" defaultChecked />
                                        <Label htmlFor="auto_any">Any Auto</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="auto_hired" name="auto_hired" defaultChecked />
                                        <Label htmlFor="auto_hired">Hired Autos</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="auto_non_owned" name="auto_non_owned" defaultChecked />
                                        <Label htmlFor="auto_non_owned">Non-Owned Autos</Label>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Workers Comp */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold text-primary">Workers Compensation</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 col-span-2 mb-2">
                                        <Checkbox id="wc_statutory" name="wc_statutory" defaultChecked />
                                        <Label htmlFor="wc_statutory">Statutory Limits Required</Label>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="wc_el_accident" className="text-xs text-muted-foreground uppercase">E.L. Each Accident</Label>
                                        <Input id="wc_el_accident" name="wc_el_accident" type="number" defaultValue="1000000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="wc_el_disease_policy" className="text-xs text-muted-foreground uppercase">E.L. Disease - Policy Limit</Label>
                                        <Input id="wc_el_disease_policy" name="wc_el_disease_policy" type="number" defaultValue="1000000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="wc_el_disease_employee" className="text-xs text-muted-foreground uppercase">E.L. Disease - Each Employee</Label>
                                        <Input id="wc_el_disease_employee" name="wc_el_disease_employee" type="number" defaultValue="1000000" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-auto h-10">
                                        <Checkbox id="wc_waiver" name="wc_waiver" defaultChecked />
                                        <Label htmlFor="wc_waiver">Waiver of Subrogation</Label>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Umbrella */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold text-primary">Umbrella / Excess</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="umbrella_occ" className="text-xs text-muted-foreground uppercase">Each Occurrence</Label>
                                        <Input id="umbrella_occ" name="umbrella_occ" type="number" defaultValue="1000000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="umbrella_agg" className="text-xs text-muted-foreground uppercase">Aggregate</Label>
                                        <Input id="umbrella_agg" name="umbrella_agg" type="number" defaultValue="1000000" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-border shrink-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        type="submit"
                        form="create-project-form"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 w-32"
                    >
                        {loading ? "Creating..." : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
