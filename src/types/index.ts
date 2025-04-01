export type UserRole = 'technologist' | 'doctor' | 'admin';

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface Provider {
  id: string;
  name: string;
  provider_id: number;
  initials: string;
  npi: string;
  specialty?: string;
  active?: boolean;
}

export interface BillingCode {
  id: string;
  code: string;
  description: string;
  category: 'CPT' | 'ICD10';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string; 
  sections: any[];
  variables: any[];
  author: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCodeAssociation {
  id?: string;
  template_id: string;
  code_id: string;
  code_type: 'CPT' | 'ICD10';
  created_at?: string;
}

export type CaseStatus = 
  | 'Scheduled' 
  | 'In Progress' 
  | 'Completed' 
  | 'Cancelled'
  | 'Arrived'
  | 'Ready'
  | 'In-Procedure'
  | 'PACU'
  | 'Departed';

export type ReportStatus = 
  | 'Not Started' 
  | 'In Progress' 
  | 'Completed'
  | 'Complete'
  | 'Summary Only'
  | 'Submitted';

export interface Procedure {
  id: string;
  patient_name: string;
  mrn: string;
  procedure_name: string;
  laterality: string;
  status: CaseStatus;
  appointment_time?: string;
  date?: string;
  dob?: string;
  location?: string;
  auth_number?: string;
  insurance_company?: string;
  line1_full?: string;
  tech_notes?: string;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields
  DOB?: string;
  AUTH?: string;
  COMP?: string;
}

export interface CaseSummary {
  id: string;
  procedure_id: string;
  summary_text: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  mrn?: string;
}

export interface CaseReport {
  id: string;
  procedure_id: string;
  report_text: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CaseBilling {
  id: string;
  procedure_id: string;
  billing_codes: Array<{code: string, modifier?: 'LT' | 'RT'}>;
  diagnosis_codes: string[];
  operators: Record<string, string>;
  provider_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  mrn?: string;
  submitted_at?: string;
}
