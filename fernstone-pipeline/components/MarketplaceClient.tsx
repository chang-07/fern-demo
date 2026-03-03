"use client";

import { useState } from "react";
import { Search, Building2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { SubcontractorDetailModal } from "@/components/SubcontractorDetailModal";

// Simplified type for the marketplace view
type MarketSubcontractor = {
    id: string;
    company_name: string | null;
    industry: string | null;
    description: string | null;
    email: string;
    status: string | null;
    projects: any;
    compliance_reports: any[];
};

export function MarketplaceClient({ initialSubcontractors }: { initialSubcontractors: MarketSubcontractor[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [minGlFilter, setMinGlFilter] = useState("all");

    // Filter Logic
    const filteredSubs = initialSubcontractors.filter((sub) => {
        // Text Match (Company Name, Description, Industry, Email)
        const lowerQuery = searchQuery.toLowerCase();
        const matchesText =
            (sub.company_name || "").toLowerCase().includes(lowerQuery) ||
            (sub.description || "").toLowerCase().includes(lowerQuery) ||
            (sub.industry || "").toLowerCase().includes(lowerQuery) ||
            sub.email.toLowerCase().includes(lowerQuery);

        // GL Coverage Match
        let matchesCoverage = true;
        const report = sub.compliance_reports?.[0];
        if (minGlFilter !== "all") {
            const minRequiredAmount = parseInt(minGlFilter);
            const subGlAmount = report?.extracted_gl_limit || 0;
            matchesCoverage = subGlAmount >= minRequiredAmount;
        }

        return matchesText && matchesCoverage;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by company name, industry, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <select
                        value={minGlFilter}
                        onChange={(e) => setMinGlFilter(e.target.value)}
                        className="h-10 rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                    >
                        <option value="all">Any GL Coverage</option>
                        <option value="1000000">$1M+ GL Coverage</option>
                        <option value="2000000">$2M+ GL Coverage</option>
                        <option value="5000000">$5M+ GL Coverage</option>
                    </select>
                </div>
            </div>

            {/* Subcontractor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/20 rounded-lg border border-slate-800 border-dashed">
                        No contractors found matching your criteria.
                    </div>
                ) : (
                    filteredSubs.map((sub) => {
                        const report = sub.compliance_reports?.[0];
                        return (
                            <SubcontractorDetailModal key={sub.id} subcontractor={sub} showContact={true}>
                                <div className="cursor-pointer group flex flex-col h-full">
                                    <Card className="bg-slate-900/50 border-slate-800 group-hover:border-slate-600 transition-colors flex flex-col flex-1">
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                                                    <Building2 className="h-3 w-3 mr-1" />
                                                    {sub.industry || 'Unspecified'}
                                                </Badge>
                                                {report?.is_compliant ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Verified</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500 border-slate-800">Unverified</Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl text-white">{sub.company_name || 'Unknown Company'}</CardTitle>
                                            <CardDescription className="text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                                {sub.description || 'No description available.'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="mt-auto pt-4 border-t border-slate-800/50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">GL Limit</span>
                                                    <span className="font-medium text-slate-200">
                                                        {report?.extracted_gl_limit
                                                            ? `$${(report.extracted_gl_limit / 1000000).toFixed(1)}M`
                                                            : 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Contact</span>
                                                    <span className="text-slate-300 truncate ml-4" title={sub.email}>
                                                        {sub.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </SubcontractorDetailModal>
                        );
                    })
                )}
            </div>
        </div>
    );
}
