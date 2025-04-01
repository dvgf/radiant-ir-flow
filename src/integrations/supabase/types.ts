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
      case_billing: {
        Row: {
          billing_codes: string[]
          diagnosis_codes: string[]
          id: string
          mrn: string
          operators: Json
          submitted_at: string | null
        }
        Insert: {
          billing_codes?: string[]
          diagnosis_codes?: string[]
          id?: string
          mrn: string
          operators?: Json
          submitted_at?: string | null
        }
        Update: {
          billing_codes?: string[]
          diagnosis_codes?: string[]
          id?: string
          mrn?: string
          operators?: Json
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_billing_mrn_fkey"
            columns: ["mrn"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      case_reports: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          report_text: string
          updated_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          report_text: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          report_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      case_summaries: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          mrn: string | null
          summary_text: string
          updated_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          mrn?: string | null
          summary_text: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          mrn?: string | null
          summary_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_summaries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          AUTH: string | null
          COMP: string | null
          created_at: string | null
          date: string
          DOB: string | null
          id: string
          laterality: string | null
          line1_full: string | null
          location: string | null
          mrn: string
          patient_name: string
          patient_sex: string | null
          priority: string | null
          procedure_name: string
          status: string | null
          tech_notes: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          AUTH?: string | null
          COMP?: string | null
          created_at?: string | null
          date: string
          DOB?: string | null
          id: string
          laterality?: string | null
          line1_full?: string | null
          location?: string | null
          mrn: string
          patient_name: string
          patient_sex?: string | null
          priority?: string | null
          procedure_name: string
          status?: string | null
          tech_notes?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          AUTH?: string | null
          COMP?: string | null
          created_at?: string | null
          date?: string
          DOB?: string | null
          id?: string
          laterality?: string | null
          line1_full?: string | null
          location?: string | null
          mrn?: string
          patient_name?: string
          patient_sex?: string | null
          priority?: string | null
          procedure_name?: string
          status?: string | null
          tech_notes?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          initials: string
          provider_id: number
          provider_name: string
        }
        Insert: {
          initials: string
          provider_id: number
          provider_name: string
        }
        Update: {
          initials?: string
          provider_id?: number
          provider_name?: string
        }
        Relationships: []
      }
      template_code_associations: {
        Row: {
          code_id: string
          code_type: string
          created_at: string
          id: string
          template_id: string
        }
        Insert: {
          code_id: string
          code_type: string
          created_at?: string
          id?: string
          template_id: string
        }
        Update: {
          code_id?: string
          code_type?: string
          created_at?: string
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_code_associations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          sections: Json
          updated_at: string
          variables: Json
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sections?: Json
          updated_at?: string
          variables?: Json
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sections?: Json
          updated_at?: string
          variables?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_procedure_status: {
        Args: {
          p_id: string
          p_status: string
          p_timestamp: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
