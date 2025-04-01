
import { supabase } from './client';

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
