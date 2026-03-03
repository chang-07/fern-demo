import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";

export default async function SubcontractorProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/login");
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'SUBCONTRACTOR') {
        // Prevent GCs from accessing the sub profile route
        return redirect('/dashboard');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Your Profile</h1>
            <p className="text-slate-400">
                Complete your profile to appear in the Fernstone Marketplace so General Contractors can find you.
            </p>

            <ProfileForm initialProfile={profile} />
        </div>
    );
}
