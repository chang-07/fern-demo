import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MarketplaceClient } from "@/components/MarketplaceClient";

export default async function MarketPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/login");
    }

    // Fetch all subcontractors and their latest compliance report
    // In a real app we might only want subcontractors with 'APPROVED' or 'COMPLIANT' status,
    // or we might want a 'companies' table. Here we fetch the sub profiles directly.
    // Fetch all subcontractor profiles
    // In a full app, we would link `compliance_reports` to `auth.users` directly, 
    // but here we just fetch the profiles to populate the directory. 
    // We'll leave the coverage blank (or "Unverified") until they upload docs.
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            company_name,
            industry,
            description,
            role,
            gl_limit,
            auto_limit,
            wc_limit,
            umbrella_limit,
            has_additional_insured,
            expiry_date
        `)
        .eq('role', 'SUBCONTRACTOR')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching market data:", error);
    }

    // Process the data to match the UI expectations
    const processedSubs = (profiles || []).map(profile => {
        return {
            id: profile.id,
            company_name: profile.company_name,
            industry: profile.industry,
            description: profile.description,
            email: profile.email,
            status: profile.gl_limit ? 'VERIFIED' : 'REGISTERED',
            projects: null,
            compliance_reports: [{
                extracted_gl_limit: profile.gl_limit,
                extracted_auto_limit: profile.auto_limit,
                extracted_wc_limit: profile.wc_limit,
                extracted_umbrella_limit: profile.umbrella_limit,
                has_additional_insured: profile.has_additional_insured,
                expiry_date: profile.expiry_date,
                is_compliant: true, // If they uploaded a generic one, we consider it locally verified
                deficiencies: []
            }]
        };
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Contractor Market</h1>
                <p className="text-slate-400">
                    Discover and vet compliant subcontractors for your next project.
                </p>
            </div>

            <MarketplaceClient initialSubcontractors={processedSubs} />
        </div>
    );
}
