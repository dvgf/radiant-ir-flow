
import { supabase } from './client';
import { ReportSubmission, SubmissionStatus } from '../../types';
import { triggerKeragonWebhook, uploadReportPdf, deliverPdfToKeragon } from './webhooks-and-storage';

type SubmissionType = 'Complete' | 'Summary Only' | 'Billing Only';

interface SubmissionData {
  procedureId: string;
  userId: string;
  submissionType: SubmissionType;
  summaryText?: string;
  reportText?: string;
  billingData?: any;
  webhookUrl?: string;
}

export async function submitReport(data: SubmissionData) {
  try {
    const { procedureId, userId, submissionType, webhookUrl } = data;
    
    // Create a submission record - using the "from" method with type casting to handle the new table
    const { data: submissionData, error } = await supabase
      .from('report_submissions' as any)
      .insert({
        procedure_id: procedureId,
        submitted_by: userId,
        submission_type: submissionType,
        submission_status: 'pending',
        details: {
          summary: data.summaryText,
          billing: data.billingData,
          report: data.reportText
        }
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating submission record:', error);
      throw error;
    }
    
    // If there's a webhook URL, trigger it
    if (webhookUrl) {
      try {
        const response = await triggerKeragonWebhook(webhookUrl);
        console.log('Webhook triggered:', response);
        
        // Update submission with reference ID if available
        if (response && response.reference_id && submissionData) {
          await supabase
            .from('report_submissions' as any)
            .update({
              keragon_reference: response.reference_id,
              submission_status: 'processing'
            })
            .eq('id', submissionData.id);
        }
      } catch (webhookError) {
        console.error('Error triggering webhook:', webhookError);
        
        // Update submission status to failed
        if (submissionData) {
          await supabase
            .from('report_submissions' as any)
            .update({
              submission_status: 'failed',
              details: {
                ...(submissionData.details || {}),
                error: (webhookError as Error).message
              }
            })
            .eq('id', submissionData.id);
        }
          
        throw webhookError;
      }
    }
    
    // Mark the report as submitted
    if (data.reportText) {
      await supabase
        .from('case_reports')
        .update({
          report_text: data.reportText
        })
        .eq('case_id', procedureId);
    }
    
    // Mark the billing as submitted
    if (data.billingData) {
      await supabase
        .from('case_billing')
        .update({
          submitted_at: new Date().toISOString()
        })
        .eq('mrn', procedureId);
    }
    
    return submissionData;
  } catch (error) {
    console.error('Error in submitReport:', error);
    throw error;
  }
}

export async function getSubmissionStatus(submissionId: string) {
  try {
    const { data, error } = await supabase
      .from('report_submissions' as any)
      .select('*')
      .eq('id', submissionId)
      .single();
      
    if (error) {
      console.error('Error fetching submission status:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSubmissionStatus:', error);
    throw error;
  }
}

export async function updateSubmissionStatus(submissionId: string, status: SubmissionStatus, details?: any) {
  try {
    const { data, error } = await supabase
      .from('report_submissions' as any)
      .update({
        submission_status: status,
        ...(details ? { details } : {})
      })
      .eq('id', submissionId)
      .select();
      
    if (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateSubmissionStatus:', error);
    throw error;
  }
}
