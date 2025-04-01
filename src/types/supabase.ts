// Import Json from the integrations/supabase/types file to avoid circular imports
import { Json } from '../integrations/supabase/types';

export type Database = {
  public: {
    Tables: {
      procedures: {
        Row: {
          id: string
          patient_name: string
          mrn: string
          procedure_name: string
          laterality: string
          status: string
          appointment_time?: string
          date?: string // For backward compatibility
          dob?: string | null
          location: string | null
          auth_number?: string | null
          insurance_company?: string | null
          line1_full: string | null
          tech_notes: string | null
          webhook_url: string | null
          created_at: string
          updated_at: string
          // Legacy fields
          DOB: string | null
          AUTH: string | null
          COMP: string | null
          patient_sex: string | null
          priority: string | null
        }
        Insert: {
          id?: string
          patient_name: string
          mrn: string
          procedure_name: string
          laterality?: string
          status?: string
          appointment_time?: string
          date?: string // For backward compatibility
          dob?: string | null
          location?: string | null
          auth_number?: string | null
          insurance_company?: string | null
          line1_full?: string | null
          tech_notes?: string | null
          webhook_url?: string | null
          created_at?: string
          updated_at?: string
          // Legacy fields
          DOB?: string | null
          AUTH?: string | null
          COMP?: string | null
          patient_sex?: string | null
          priority?: string | null
        }
        Update: {
          id?: string
          patient_name?: string
          mrn?: string
          procedure_name?: string
          laterality?: string
          status?: string
          appointment_time?: string
          date?: string // For backward compatibility
          dob?: string | null
          location?: string | null
          auth_number?: string | null
          insurance_company?: string | null
          line1_full?: string | null
          tech_notes?: string | null
          webhook_url?: string | null
          created_at?: string
          updated_at?: string
          // Legacy fields
          DOB?: string | null
          AUTH?: string | null
          COMP?: string | null
          patient_sex?: string | null
          priority?: string | null
        }
      }
      case_summaries: {
        Row: {
          id: string
          case_id: string // Changed to case_id to match DB
          mrn: string | null
          summary_text: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          case_id: string // Changed to case_id to match DB
          mrn?: string | null
          summary_text: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          case_id?: string // Changed to case_id to match DB
          mrn?: string | null
          summary_text?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      case_reports: {
        Row: {
          id: string
          case_id: string // Changed to case_id to match DB
          report_text: string
          pdf_url: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          case_id: string // Changed to case_id to match DB
          report_text: string
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          case_id?: string // Changed to case_id to match DB
          report_text?: string
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      case_billing: {
        Row: {
          id: string
          procedure_id: string // New field name
          mrn: string | null
          billing_codes: Json
          diagnosis_codes: string[]
          operators: Json
          provider_id: string
          created_at: string
          updated_at: string
          created_by: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          procedure_id: string // New field name
          mrn?: string | null
          billing_codes: Json
          diagnosis_codes: string[]
          operators: Json
          provider_id: string
          created_at?: string
          updated_at?: string
          created_by: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          procedure_id?: string // New field name
          mrn?: string | null
          billing_codes?: Json
          diagnosis_codes?: string[]
          operators?: Json
          provider_id?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          submitted_at?: string | null
        }
      }
      providers: {
        Row: {
          id: string
          provider_name: string
          provider_id: number
          initials: string
          npi: string
          specialty: string
          active: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          provider_name: string
          provider_id: number
          initials: string
          npi: string
          specialty: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_name?: string
          provider_id?: number
          initials?: string
          npi?: string
          specialty?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      billing_codes: {
        Row: {
          id: string
          code: string
          description: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          sections: Json
          variables: Json
          author: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          sections: Json
          variables: Json
          author: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          sections?: Json
          variables?: Json
          author?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string
        }
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
