import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileUploadCard } from "@/components/ProfileUploadCard"
import { ShieldCheck, User } from "lucide-react"

export default async function SubcontractorDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect("/login")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'SUBCONTRACTOR') {
        return redirect('/dashboard')
    }

    const hasLimits = profile.gl_limit !== null

    return (
        <div className="container mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-slate-400">
                    Welcome back, <span className="font-medium text-white">{profile.company_name || user.email}</span>. Manage your insurance coverage limits below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Card */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Update Coverage</h2>
                    <ProfileUploadCard userId={user.id} />
                </div>

                {/* Current Limits Display */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Current Verified Limits</h2>

                    {hasLimits ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-500 mb-6 pb-4 border-b border-slate-800">
                                <ShieldCheck className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Coverage Active</h3>
                            </div>

                            <dl className="space-y-4">
                                <div className="flex justify-between">
                                    <dt className="text-slate-400">General Liability</dt>
                                    <dd className="font-medium text-white">${(profile.gl_limit || 0).toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-400">Auto Liability</dt>
                                    <dd className="font-medium text-white">${(profile.auto_limit || 0).toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-400">Workers Comp</dt>
                                    <dd className="font-medium text-white">${(profile.wc_limit || 0).toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-400">Umbrella</dt>
                                    <dd className="font-medium text-white">${(profile.umbrella_limit || 0).toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-slate-800">
                                    <dt className="text-slate-400">Additional Insured</dt>
                                    <dd className="font-medium text-white">{profile.has_additional_insured ? 'Yes' : 'No'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-400">Expiry Date</dt>
                                    <dd className="font-medium text-white">{profile.expiry_date || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                            <User className="w-12 h-12 mb-4 text-slate-700" />
                            <p>No insurance data uploaded yet.</p>
                            <p className="text-sm mt-2">Upload your ACORD form to extract your limits.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
