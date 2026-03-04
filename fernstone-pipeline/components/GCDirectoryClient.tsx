"use client";

import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ContactGCModal } from "@/components/ContactGCModal";

export type GCProfile = {
    id: string;
    company_name: string | null;
    industry: string | null;
    description: string | null;
    email: string;
};

export function GCDirectoryClient({
    initialGCs,
    subcontractorId
}: {
    initialGCs: GCProfile[],
    subcontractorId: string
}) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter Logic
    const filteredGCs = initialGCs.filter((gc) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (gc.company_name || "").toLowerCase().includes(lowerQuery) ||
            (gc.description || "").toLowerCase().includes(lowerQuery) ||
            (gc.industry || "").toLowerCase().includes(lowerQuery) ||
            gc.email.toLowerCase().includes(lowerQuery);
    });

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="Search general contractors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500"
                />
            </div>

            {/* GC Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGCs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/20 rounded-lg border border-slate-800 border-dashed">
                        No general contractors found matching your search.
                    </div>
                ) : (
                    filteredGCs.map((gc) => (
                        <Card key={gc.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-600 transition-colors flex flex-col h-full">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                                        <Building2 className="h-3 w-3 mr-1" />
                                        {gc.industry || 'General Contractor'}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl text-white">{gc.company_name || 'Unknown Company'}</CardTitle>
                                <CardDescription className="text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                                    {gc.description || 'No description available.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                                <span className="text-sm text-slate-500 truncate mr-4" title={gc.email}>
                                    {gc.email}
                                </span>

                                <ContactGCModal
                                    subcontractorId={subcontractorId}
                                    gcId={gc.id}
                                    projectName="General Inquiry"
                                    defaultSubject="General Inquiry / Introduction"
                                    defaultMessage={`Hi ${gc.company_name || 'Team'},\n\nI found your profile on the Fernstone network and would love to connect regarding any upcoming bidding opportunities.\n\nThanks,\nSubcontractor`}
                                >
                                    <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                        Message
                                    </button>
                                </ContactGCModal>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
