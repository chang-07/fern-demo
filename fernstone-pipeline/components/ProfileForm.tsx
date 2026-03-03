"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/actions/update-profile";
import { toast } from "sonner";
import { Building2, Save } from "lucide-react";

import { useRouter } from "next/navigation";

export function ProfileForm({ initialProfile }: { initialProfile: any }) {
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        const res = await updateProfile(formData);
        setIsSaving(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated successfully!");
            router.push('/dashboard/market');
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl mt-8">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="company_name" className="text-slate-200">Company Name</Label>
                    <Input
                        id="company_name"
                        name="company_name"
                        defaultValue={initialProfile?.company_name || ""}
                        placeholder="e.g. Apex Builders LLC"
                        className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="industry" className="text-slate-200">Industry / Trade</Label>
                    <Input
                        id="industry"
                        name="industry"
                        defaultValue={initialProfile?.industry || ""}
                        placeholder="e.g. Plumbing, Electrical, General Contracting"
                        className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description" className="text-slate-200">Company Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={initialProfile?.description || ""}
                        placeholder="Briefly describe your services, specialties, and experience..."
                        className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 h-32 resize-none"
                    />
                    <p className="text-sm text-slate-500">This description will be visible to General Contractors in the Marketplace.</p>
                </div>
            </div>

            <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSaving ? "Saving..." : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                    </>
                )}
            </Button>
        </form>
    );
}
