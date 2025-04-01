
import { supabase } from './client';
import { Procedure } from '../../types';

export async function fetchProcedures(filters: {
  startDate?: string;
  endDate?: string;
  procedureType?: string;
  status?: string;
  reportStatus?: string;
} = {}) {
  const { startDate, endDate, procedureType, status } = filters;
  
  let query = supabase
    .from('procedures')
    .select('*')
    .order('date', { ascending: false });
  
  // Apply date filters if provided
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  // Apply procedure type filter if provided
  if (procedureType) {
    query = query.ilike('procedure_name', `%${procedureType}%`);
  }
  
  // Apply status filter if provided
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
    
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

export async function fetchTodaysProcedures() {
  const today = new Date().toISOString().split('T')[0];
  return fetchProcedures({ startDate: today, endDate: today });
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
      .update({ tech_notes }) 
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
