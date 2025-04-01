
export type UserRole = 'doctor' | 'admin' | 'technologist';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export type CaseStatus = 'Scheduled' | 'Arrived' | 'Ready' | 'In-Procedure' | 'PACU' | 'Departed';
export type ReportStatus = 'Not Started' | 'Summary Only' | 'Complete' | 'Submitted';

export interface Procedure {
  id: string;
  patient_name: string;
  mrn: string;
  procedure_name: string;
  laterality: string;
  status: CaseStatus;
  appointment_time: string;
  dob?: string;
  location?: string;
  auth_number?: string;
  insurance_company?: string;
  line1_full?: string;
  tech_notes?: string;
  webhook_url?: string;
  DOB?: string;
  AUTH?: string;
  COMP?: string;
  created_at?: string;
  updated_at?: string;
  date?: string; // Added to support the database column until fully migrated
}

export interface CaseSummary {
  id: string;
  procedure_id: string; // Changed from "case_id" to match DB schema
  summary_text: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  mrn?: string;
}

export interface CaseReport {
  id: string;
  procedure_id: string; // Changed from "case_id" to match DB schema
  report_text: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface BillingCode {
  id: string;
  code: string;
  description: string;
  category: 'CPT' | 'ICD10';
}

export interface CaseBilling {
  id: string;
  procedure_id: string; // Changed from "case_id" to match DB schema
  billing_codes: Array<{code: string, modifier?: 'LT' | 'RT'}>;
  diagnosis_codes: string[];
  operators: Record<string, string>;
  provider_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  mrn?: string;
}

export interface Provider {
  id: string;
  provider_name: string; // Keep original property name from DB
  name?: string; // Added for compatibility
  provider_id?: number;
  initials?: string;
  npi: string;
  specialty: string;
  active: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: Record<string, any>;
  variables: Record<string, any>;
  author: string;
  created_at: string;
  updated_at: string;
}
