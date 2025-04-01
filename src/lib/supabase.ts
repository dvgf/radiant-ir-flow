
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { CaseSummary, CaseReport, CaseBilling } from '../types';

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
  
  return data;
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
  const formattedBilling = {
    procedure_id: billing.procedure_id,
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
  
  return data;
}

export async function fetchBillingCodes(category: 'CPT' | 'ICD10') {
  // Since we don't have a billing_codes table yet, we'll mock this data
  // Later this should be replaced with an actual query
  const mockCodes = category === 'CPT' 
    ? [
        { id: '1', code: '36901', description: 'Diagnostic angiography', category: 'CPT' },
        { id: '2', code: '36902', description: 'Thrombectomy', category: 'CPT' },
        { id: '3', code: '36903', description: 'Stent placement', category: 'CPT' }
      ]
    : [
        { id: '4', code: 'N18.6', description: 'End stage renal disease', category: 'ICD10' },
        { id: '5', code: 'I82.4', description: 'Venous thrombosis', category: 'ICD10' },
        { id: '6', code: 'Z99.2', description: 'Dependence on renal dialysis', category: 'ICD10' }
      ];
  
  return mockCodes;
}

export async function fetchTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
  
  // Convert jsonb to proper Record objects
  return data.map(template => ({
    ...template,
    sections: typeof template.sections === 'string' 
      ? JSON.parse(template.sections) 
      : template.sections,
    variables: typeof template.variables === 'string' 
      ? JSON.parse(template.variables) 
      : template.variables,
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
