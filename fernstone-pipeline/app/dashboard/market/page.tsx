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
    const { data: subcontractors, error } = await supabase
        .from('subcontractors')
        .select(`
            id,
            email,
            company_name,
            industry,
            description,
            status,
            compliance_reports (
                extracted_gl_limit,
                has_additional_insured,
                extracted_auto_limit,
                extracted_wc_limit,
                extracted_umbrella_limit,
                is_compliant
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching market data:", error);
    }

    // Process the data so each subcontractor has a single "latest" report associated with it for the UI
    const processedSubs = (subcontractors || []).map(sub => {
        // Find the most complete/latest report if there are multiple.
        // For simplicity, we just take the first one returned (or null)
        const reports = sub.compliance_reports as any[];
        const report = reports && reports.length > 0 ? reports[0] : null;

        return {
            id: sub.id,
            company_name: sub.company_name || 'Unknown Company',
            industry: sub.industry || 'Unspecified',
            description: sub.description || 'No description provided.',
            email: sub.email,
            status: sub.status,
            report
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
