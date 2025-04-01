
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { CaseSummary, CaseReport, CaseBilling, Procedure, Template, BillingCode, Provider } from '../types';
import { Json } from '../integrations/supabase/types';

// Use the values from the Supabase integration client
import { supabase as supabaseClient } from '../integrations/supabase/client';

// Export the client that's already properly configured
export const supabase = supabaseClient;

export async function fetchTodaysProcedures() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .gte('date', `${today}`)
    .lte('date', `${today}`)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching procedures:', error);
    throw error;
  }
  
  // Map the DB result to the Procedure interface
  return data.map((p: any) => ({
    id: p.id,
    patient_name: p.patient_name,
    mrn: p.mrn,
    procedure_name: p.procedure_name,
    laterality: p.laterality || '',
    status: p.status || 'Scheduled',
    appointment_time: p.date, // Use date as appointment_time
    dob: p.DOB, // Use DOB (uppercase) from database
    location: p.location,
    auth_number: p.AUTH, // Use AUTH (uppercase) from database
    insurance_company: p.COMP, // Use COMP (uppercase) from database
    line1_full: p.line1_full,
    tech_notes: p.tech_notes || '',
    webhook_url: p.webhook_url,
    // Include original DB fields for compatibility
    DOB: p.DOB,
    AUTH: p.AUTH,
    COMP: p.COMP,
    created_at: p.created_at,
    updated_at: p.updated_at,
    date: p.date
  }));
}

export async function fetchProcedure(id: string): Promise<Procedure> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching procedure:', error);
    throw error;
  }
  
  // Map the DB result to the Procedure interface
  return {
    id: data.id,
    patient_name: data.patient_name,
    mrn: data.mrn,
    procedure_name: data.procedure_name,
    laterality: data.laterality || '',
    status: (data.status || 'Scheduled') as Procedure['status'],
    appointment_time: data.date, // Use date as appointment_time
    dob: data.DOB, // Use DOB (uppercase) from database
    location: data.location || 'Unassigned',
    auth_number: data.AUTH, // Use AUTH (uppercase) from database
    insurance_company: data.COMP, // Use COMP (uppercase) from database
    line1_full: data.line1_full || '',
    tech_notes: data.tech_notes || '',
    webhook_url: data.webhook_url,
    // Include original DB fields for compatibility
    DOB: data.DOB,
    AUTH: data.AUTH,
    COMP: data.COMP,
    created_at: data.created_at,
    updated_at: data.updated_at,
    date: data.date
  };
}

export async function updateProcedureStatus(id: string, status: string) {
  const { error } = await supabase
    .from('procedures')
    .update({ status })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating procedure status:', error);
    throw error;
  }
}

export async function updateProcedureLocation(id: string, location: string) {
  const { error } = await supabase
    .from('procedures')
    .update({ location })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating procedure location:', error);
    throw error;
  }
}

export async function updateTechNotes(id: string, tech_notes: string) {
  try {
    const { error } = await supabase
      .from('procedures')
      .update({ tech_notes }) // This is now valid with the updated type definition
      .eq('id', id);
      
    if (error) {
      console.error('Error updating tech notes:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update tech_notes:', error);
    // Log error but don't throw to prevent app crashes
  }
}

export async function fetchCaseSummary(procedureId: string): Promise<CaseSummary | null> {
  const { data, error } = await supabase
    .from('case_summaries')
    .select('*')
    .eq('case_id', procedureId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching case summary:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Map to the CaseSummary interface
  return {
    id: data.id,
    procedure_id: data.case_id, // Map case_id to procedure_id
    summary_text: data.summary_text,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    created_by: data.created_at || new Date().toISOString(), // Use created_at as created_by
    mrn: data.mrn
  };
}

export async function fetchCaseReport(procedureId: string): Promise<CaseReport | null> {
  const { data, error } = await supabase
    .from('case_reports')
    .select('*')
    .eq('case_id', procedureId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching case report:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Map to the CaseReport interface
  return {
    id: data.id,
    procedure_id: data.case_id, // Map case_id to procedure_id
    report_text: data.report_text,
    pdf_url: undefined, // Set default pdf_url as undefined
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    created_by: data.created_at || new Date().toISOString() // Use created_at as created_by
  };
}

export async function fetchCaseBilling(procedureId: string): Promise<CaseBilling | null> {
  // Try to find a case_billing entry that matches the procedureId
  const { data, error } = await supabase
    .from('case_billing')
    .select('*')
    .eq('mrn', procedureId) // Use mrn as the key for now
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching case billing:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Format billing codes from DB
  const billingCodes = Array.isArray(data.billing_codes) 
    ? data.billing_codes.map((code: string) => {
        if (typeof code === 'string') {
          const [codeValue, modifier] = code.split(':');
          return { 
            code: codeValue,
            modifier: modifier as 'LT' | 'RT' | undefined
          };
        }
        return { code: String(code) }; // Use String() instead of toString()
      })
    : [];
  
  // Map to the CaseBilling interface with safe defaults
  return {
    id: data.id,
    procedure_id: procedureId, // Use procedureId as procedure_id
    billing_codes: billingCodes,
    diagnosis_codes: data.diagnosis_codes || [],
    operators: typeof data.operators === 'string' 
      ? JSON.parse(data.operators)
      : (data.operators as Record<string, string> || {}),
    provider_id: "default", // Set a default value for provider_id
    created_at: new Date().toISOString(), // Use current time as fallback
    updated_at: new Date().toISOString(), // Use current time as fallback
    created_by: "system", // Set a default value for created_by
    mrn: data.mrn
  };
}

export async function saveCaseSummary(summary: Partial<CaseSummary>) {
  // Convert to DB schema field names
  const formattedSummary = {
    case_id: summary.procedure_id, // Use procedure_id as case_id
    summary_text: summary.summary_text,
    mrn: summary.mrn
  };

  const { data, error } = await supabase
    .from('case_summaries')
    .upsert(formattedSummary)
    .select();
    
  if (error) {
    console.error('Error saving case summary:', error);
    throw error;
  }
  
  return data[0];
}

export async function saveCaseReport(report: Partial<CaseReport>) {
  // Convert to DB schema field names
  const formattedReport = {
    case_id: report.procedure_id, // Use procedure_id as case_id
    report_text: report.report_text
  };

  const { data, error } = await supabase
    .from('case_reports')
    .upsert(formattedReport)
    .select();
    
  if (error) {
    console.error('Error saving case report:', error);
    throw error;
  }
  
  return data[0];
}

export async function saveCaseBilling(billing: Partial<CaseBilling>) {
  // Format billing codes to strings for the database
  const formattedBillingCodes = billing.billing_codes?.map(code => {
    if (typeof code === 'string') return code;
    return code.modifier ? `${code.code}:${code.modifier}` : code.code;
  });
  
  // Convert to DB schema field names
  const formattedBilling = {
    mrn: billing.procedure_id, // Use procedure_id as mrn
    billing_codes: formattedBillingCodes,
    diagnosis_codes: billing.diagnosis_codes,
    operators: billing.operators
  };

  const { data, error } = await supabase
    .from('case_billing')
    .upsert(formattedBilling)
    .select();
    
  if (error) {
    console.error('Error saving case billing:', error);
    throw error;
  }
  
  return data[0];
}

export async function fetchProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('*');
    
  if (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
  
  // Map provider data to match our Provider interface
  return data.map((provider: any) => ({
    id: provider.provider_id.toString(),
    provider_name: provider.provider_name,
    name: provider.name || provider.provider_name, // Use name if available, otherwise use provider_name
    provider_id: provider.provider_id,
    initials: provider.initials,
    npi: provider.provider_id.toString(),
    specialty: 'Unknown', // Set default as the field may not exist
    active: true, // Set default as the field may not exist
  }));
}

export async function fetchBillingCodes(category: 'CPT' | 'ICD10') {
  try {
    // Use mock data since the billing_codes table may not exist
    const mockCodes = category === 'CPT' 
      ? [
          { id: '1', code: '36901', description: 'Diagnostic angiography', category: 'CPT' as const },
          { id: '2', code: '36902', description: 'Thrombectomy', category: 'CPT' as const },
          { id: '3', code: '36903', description: 'Stent placement', category: 'CPT' as const }
        ]
      : [
          { id: '4', code: 'N18.6', description: 'End stage renal disease', category: 'ICD10' as const },
          { id: '5', code: 'I82.4', description: 'Venous thrombosis', category: 'ICD10' as const },
          { id: '6', code: 'Z99.2', description: 'Dependence on renal dialysis', category: 'ICD10' as const }
        ];
    
    return mockCodes;
  } catch (error) {
    console.error('Error fetching billing codes:', error);
    // Fallback to mock data if table doesn't exist or query fails
    const mockCodes = category === 'CPT' 
      ? [
          { id: '1', code: '36901', description: 'Diagnostic angiography', category: 'CPT' as const },
          { id: '2', code: '36902', description: 'Thrombectomy', category: 'CPT' as const },
          { id: '3', code: '36903', description: 'Stent placement', category: 'CPT' as const }
        ]
      : [
          { id: '4', code: 'N18.6', description: 'End stage renal disease', category: 'ICD10' as const },
          { id: '5', code: 'I82.4', description: 'Venous thrombosis', category: 'ICD10' as const },
          { id: '6', code: 'Z99.2', description: 'Dependence on renal dialysis', category: 'ICD10' as const }
        ];
    
    return mockCodes;
  }
}

export async function fetchTemplates() {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Map to the Template interface
    return data.map((template: any) => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: template.category,
      sections: template.sections,
      variables: template.variables,
      author: template.author || 'Unknown',
      created_at: template.created_at,
      updated_at: template.updated_at
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export async function triggerKeragonWebhook(webhookUrl: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'refresh_schedule',
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error triggering Keragon webhook:', error);
    throw error;
  }
}

export async function uploadReportPdf(mrn: string, procedureId: string, pdfBlob: Blob) {
  const filePath = `reports/${mrn}/${procedureId}.pdf`;
  
  const { data, error } = await supabase
    .storage
    .from('reports')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });
    
  if (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
  
  const { data: urlData } = supabase
    .storage
    .from('reports')
    .getPublicUrl(filePath);
    
  return urlData.publicUrl;
}

export async function deliverPdfToKeragon(webhookUrl: string, pdfUrl: string, procedureId: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deliver_pdf',
        procedure_id: procedureId,
        pdf_url: pdfUrl,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error delivering PDF to Keragon:', error);
    throw error;
  }
}
