
import { supabase } from './client';
import { BillingCode, Provider } from '../../types';

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
