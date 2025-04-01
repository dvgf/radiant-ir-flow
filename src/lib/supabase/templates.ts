
import { supabase } from './client';
import { Template } from '../../types';

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
