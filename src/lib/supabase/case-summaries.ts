
import { supabase } from './client';
import { CaseSummary } from '../../types';

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
