
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { CaseSummary, CaseReport, CaseBilling, Procedure } from '../types';

// Use the values from the Supabase integration client
import { supabase as supabaseClient } from '../integrations/supabase/client';

// Export the client that's already properly configured
export const supabase = supabaseClient;

export async function fetchTodaysProcedures() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .gte('appointment_time', `${today}T00:00:00`)
    .lte('appointment_time', `${today}T23:59:59`)
    .order('appointment_time', { ascending: true });
    
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
    appointment_time: p.appointment_time || p.date, // Support both column names
    dob: p.dob || p.DOB,
    location: p.location,
    auth_number: p.auth_number || p.AUTH,
    insurance_company: p.insurance_company || p.COMP,
    line1_full: p.line1_full,
    tech_notes: p.tech_notes,
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
  const { error } = await supabase
    .from('procedures')
    .update({ tech_notes })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating tech notes:', error);
    throw error;
  }
}

export async function saveCaseSummary(summary: Partial<CaseSummary>) {
  // Convert to DB schema field names
  const formattedSummary = {
    procedure_id: summary.procedure_id,
    summary_text: summary.summary_text,
    created_by: summary.created_by,
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
    procedure_id: report.procedure_id,
    report_text: report.report_text,
    pdf_url: report.pdf_url,
    created_by: report.created_by,
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
  // Convert to DB schema field names
  const formattedBilling = {
    procedure_id: billing.procedure_id,
    mrn: billing.mrn, // Keep for backward compatibility
    billing_codes: billing.billing_codes,
    diagnosis_codes: billing.diagnosis_codes,
    operators: billing.operators,
    provider_id: billing.provider_id,
    created_by: billing.created_by,
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
    .select('*')
    .eq('active', true);
    
  if (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
  
  // Map provider data to match our Provider interface
  return data.map((provider: any) => ({
    id: provider.id || provider.provider_id.toString(),
    provider_name: provider.provider_name,
    name: provider.provider_name, // Add for compatibility
    provider_id: provider.provider_id,
    initials: provider.initials,
    npi: provider.npi || provider.provider_id.toString(),
    specialty: provider.specialty || 'Unknown',
    active: provider.active !== false, // default to true if not specified
  }));
}

export async function fetchBillingCodes(category: 'CPT' | 'ICD10') {
  // Use the actual table for billing codes
  const { data, error } = await supabase
    .from('billing_codes')
    .select('*')
    .eq('category', category);
    
  if (error || !data) {
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
  
  // Ensure category is correctly typed
  return data.map(code => ({
    ...code,
    category: code.category === 'CPT' ? 'CPT' as const : 'ICD10' as const
  }));
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
