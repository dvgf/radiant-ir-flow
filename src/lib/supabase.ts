
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These environment variables will need to be set in Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your setup.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
  const { data, error } = await supabase
    .from('case_summaries')
    .upsert(summary)
    .select();
    
  if (error) {
    console.error('Error saving case summary:', error);
    throw error;
  }
  
  return data[0];
}

export async function saveCaseReport(report: Partial<CaseReport>) {
  const { data, error } = await supabase
    .from('case_reports')
    .upsert(report)
    .select();
    
  if (error) {
    console.error('Error saving case report:', error);
    throw error;
  }
  
  return data[0];
}

export async function saveCaseBilling(billing: Partial<CaseBilling>) {
  const { data, error } = await supabase
    .from('case_billing')
    .upsert(billing)
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
    .eq('active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
  
  return data;
}

export async function fetchBillingCodes(category: 'CPT' | 'ICD10') {
  const { data, error } = await supabase
    .from('billing_codes')
    .select('*')
    .eq('category', category)
    .order('code');
    
  if (error) {
    console.error('Error fetching billing codes:', error);
    throw error;
  }
  
  return data;
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
  
  return data;
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
