
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          appointment_time: string
          dob: string | null
          location: string | null
          auth_number: string | null
          insurance_company: string | null
          line1_full: string | null
          tech_notes: string | null
          webhook_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          mrn: string
          procedure_name: string
          laterality: string
          status: string
          appointment_time: string
          dob?: string | null
          location?: string | null
          auth_number?: string | null
          insurance_company?: string | null
          line1_full?: string | null
          tech_notes?: string | null
          webhook_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          mrn?: string
          procedure_name?: string
          laterality?: string
          status?: string
          appointment_time?: string
          dob?: string | null
          location?: string | null
          auth_number?: string | null
          insurance_company?: string | null
          line1_full?: string | null
          tech_notes?: string | null
          webhook_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      case_summaries: {
        Row: {
          id: string
          procedure_id: string
          summary_text: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          procedure_id: string
          summary_text: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          procedure_id?: string
          summary_text?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      case_reports: {
        Row: {
          id: string
          procedure_id: string
          report_text: string
          pdf_url: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          procedure_id: string
          report_text: string
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          procedure_id?: string
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
          procedure_id: string
          billing_codes: Json
          diagnosis_codes: string[]
          operators: Json
          provider_id: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          procedure_id: string
          billing_codes: Json
          diagnosis_codes: string[]
          operators: Json
          provider_id: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          procedure_id?: string
          billing_codes?: Json
          diagnosis_codes?: string[]
          operators?: Json
          provider_id?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      providers: {
        Row: {
          id: string
          name: string
          npi: string
          specialty: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          npi: string
          specialty: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
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
