
import { supabase } from './client';
import { CaseBilling } from '../../types';

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
