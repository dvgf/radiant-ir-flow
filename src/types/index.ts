
export type UserRole = 'technologist' | 'doctor' | 'admin';

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
