
import { supabase } from './client';
import { fetchBillingCodes } from './providers-and-codes';
import { fetchTemplates } from './templates';
import { TemplateCodeAssociation } from '@/types';

// Function to fetch template-code associations
export async function fetchTemplateCodeAssociations() {
  try {
    // Need to cast to any because the table isn't in the types yet
    const { data, error } = await supabase
      .from('template_code_associations' as any)
      .select('*');
      
    if (error) {
      console.error('Error fetching template code associations:', error);
      return [];
    }
    
    // Use a proper type assertion that validates the data shape
    return (data || []) as TemplateCodeAssociation[];
  } catch (error) {
    console.error('Error in fetchTemplateCodeAssociations:', error);
    return [];
  }
}

// Function to save a template-code association
export async function saveTemplateCodeAssociation(association: TemplateCodeAssociation) {
  try {
    // Need to cast to any because the table isn't in the types yet
    const { data, error } = await supabase
      .from('template_code_associations' as any)
      .upsert(association as any)
      .select();
      
    if (error) {
      console.error('Error saving template code association:', error);
      throw error;
    }
    
    // Use a proper type assertion
    return (data && data.length > 0 ? data[0] : null) as TemplateCodeAssociation;
  } catch (error) {
    console.error('Error in saveTemplateCodeAssociation:', error);
    throw error;
  }
}

// Function to delete a template-code association
export async function deleteTemplateCodeAssociation(id: string) {
  try {
    // Need to cast to any because the table isn't in the types yet
    const { error } = await supabase
      .from('template_code_associations' as any)
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting template code association:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTemplateCodeAssociation:', error);
    throw error;
  }
}

// Function to load both templates and billing codes
export async function loadTemplatesAndCodes() {
  try {
    const [templates, cptCodes, icd10Codes] = await Promise.all([
      fetchTemplates(),
      fetchBillingCodes('CPT'),
      fetchBillingCodes('ICD10')
    ]);
    
    return {
      templates,
      billingCodes: {
        cpt: cptCodes,
        icd10: icd10Codes
      }
    };
  } catch (error) {
    console.error('Error in loadTemplatesAndCodes:', error);
    throw error;
  }
}
