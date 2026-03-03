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
            projects (
                id,
                name,
                req_gl_occurrence,
                req_additional_insured,
                req_auto_limit,
                req_wc_limit,
                req_umbrella_limit
            ),
            compliance_reports (
                extracted_gl_limit,
                has_additional_insured,
                extracted_auto_limit,
                extracted_wc_limit,
                extracted_umbrella_limit,
                is_compliant,
                deficiencies,
                expiry_date
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching market data:", error);
    }

    // Pass the raw data structure directly so SubcontractorDetailModal can parse it properly
    const processedSubs = subcontractors || [];

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
