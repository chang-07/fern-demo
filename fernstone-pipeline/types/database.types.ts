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
            projects: {
                Row: {
                    id: string
                    gc_id: string
                    name: string
                    req_gl_occurrence: number | null
                    req_additional_insured: boolean | null
                    requirements: Json | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    gc_id: string
                    name: string
                    req_gl_occurrence?: number | null
                    req_additional_insured?: boolean | null
                    requirements?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    gc_id?: string
                    name?: string
                    req_gl_occurrence?: number | null
                    req_additional_insured?: boolean | null
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
                    status: string | null
                    magic_link_token: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    project_id: string
                    email: string
                    status?: string | null
                    magic_link_token?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    project_id?: string
                    email?: string
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
                    expiry_date: string | null
                    raw_ai_output: Json | null
                    is_compliant: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    sub_id: string
                    extracted_gl_limit?: number | null
                    has_additional_insured?: boolean | null
                    expiry_date?: string | null
                    raw_ai_output?: Json | null
                    is_compliant?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    sub_id?: string
                    extracted_gl_limit?: number | null
                    has_additional_insured?: boolean | null
                    expiry_date?: string | null
                    raw_ai_output?: Json | null
                    is_compliant?: boolean | null
                    created_at?: string | null
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
