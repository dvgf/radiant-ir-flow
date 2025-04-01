
import { supabase } from './client';
import { CaseReport } from '../../types';

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
