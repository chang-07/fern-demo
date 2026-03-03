export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    role: string
                    company_name: string | null
                    industry: string | null
                    description: string | null
                    gl_limit: number | null
                    auto_limit: number | null
                    wc_limit: number | null
                    umbrella_limit: number | null
                    has_additional_insured: boolean | null
                    expiry_date: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: string
                    company_name?: string | null
                    industry?: string | null
                    description?: string | null
                    gl_limit?: number | null
                    auto_limit?: number | null
                    wc_limit?: number | null
                    umbrella_limit?: number | null
                    has_additional_insured?: boolean | null
                    expiry_date?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: string
                    company_name?: string | null
                    industry?: string | null
                    description?: string | null
                    gl_limit?: number | null
                    auto_limit?: number | null
                    wc_limit?: number | null
                    umbrella_limit?: number | null
                    has_additional_insured?: boolean | null
                    expiry_date?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            projects: {
                Row: {
                    id: string
                    gc_id: string
                    name: string
                    status: string | null
                    req_gl_occurrence: number | null
                    req_additional_insured: boolean | null
                    req_auto_limit: number | null
                    req_wc_limit: number | null
                    req_umbrella_limit: number | null
                    requirements: Json | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    gc_id: string
                    name: string
                    status?: string | null
                    req_gl_occurrence?: number | null
                    req_additional_insured?: boolean | null
                    req_auto_limit?: number | null
                    req_wc_limit?: number | null
                    req_umbrella_limit?: number | null
                    requirements?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    gc_id?: string
                    name?: string
                    status?: string | null
                    req_gl_occurrence?: number | null
                    req_additional_insured?: boolean | null
                    req_auto_limit?: number | null
                    req_wc_limit?: number | null
                    req_umbrella_limit?: number | null
                    requirements?: Json | null
                    created_at?: string | null
                }
                Relationships: []
            }
            subcontractors: {
                Row: {
                    id: string
                    project_id: string
                    email: string
                    company_name: string | null
                    description: string | null
                    industry: string | null
                    status: string | null // INVITED, UPLOADED, COMPLIANT, NON_COMPLIANT, APPROVED
                    magic_link_token: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    project_id: string
                    email: string
                    company_name?: string | null
                    description?: string | null
                    industry?: string | null
                    status?: string | null
                    magic_link_token?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    project_id?: string
                    email?: string
                    company_name?: string | null
                    description?: string | null
                    industry?: string | null
                    status?: string | null
                    magic_link_token?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "subcontractors_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    }
                ]
            }
            compliance_reports: {
                Row: {
                    id: string
                    sub_id: string
                    extracted_gl_limit: number | null
                    has_additional_insured: boolean | null
                    extracted_auto_limit: number | null
                    has_any_auto: boolean | null
                    extracted_wc_limit: number | null
                    wc_statutory_limits: boolean | null
                    extracted_umbrella_limit: number | null
                    expiry_date: string | null
                    raw_ai_output: Json | null
                    is_compliant: boolean | null
                    deficiencies: Json | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    sub_id: string
                    extracted_gl_limit?: number | null
                    has_additional_insured?: boolean | null
                    extracted_auto_limit?: number | null
                    has_any_auto?: boolean | null
                    extracted_wc_limit?: number | null
                    wc_statutory_limits?: boolean | null
                    extracted_umbrella_limit?: number | null
                    expiry_date?: string | null
                    raw_ai_output?: Json | null
                    is_compliant?: boolean | null
                    deficiencies?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    sub_id?: string
                    extracted_gl_limit?: number | null
                    has_additional_insured?: boolean | null
                    extracted_auto_limit?: number | null
                    has_any_auto?: boolean | null
                    extracted_wc_limit?: number | null
                    wc_statutory_limits?: boolean | null
                    extracted_umbrella_limit?: number | null
                    expiry_date?: string | null
                    raw_ai_output?: Json | null
                    is_compliant?: boolean | null
                    created_at: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "compliance_reports_sub_id_fkey"
                        columns: ["sub_id"]
                        isOneToOne: false
                        referencedRelation: "subcontractors"
                        referencedColumns: ["id"]
                    }
                ]
            }
            job_postings: {
                Row: {
                    id: string
                    gc_id: string
                    project_id: string | null
                    title: string
                    description: string | null
                    industry_focus: string | null
                    status: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    gc_id: string
                    project_id?: string | null
                    title: string
                    description?: string | null
                    industry_focus?: string | null
                    status?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    gc_id?: string
                    project_id?: string | null
                    title?: string
                    description?: string | null
                    industry_focus?: string | null
                    status?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "job_postings_gc_id_fkey"
                        columns: ["gc_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_postings_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
