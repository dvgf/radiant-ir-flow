
import React from 'react';
import { Procedure, CaseSummary, CaseReport, CaseBilling, BillingCode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fetchBillingCodes, fetchProviders } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ReportPreviewProps {
  procedure: Procedure;
  summary: CaseSummary | null;
  report: CaseReport | null;
  billing: CaseBilling | null;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ 
  procedure, 
  summary, 
  report, 
  billing 
}) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [cptCodes, setCptCodes] = useState<BillingCode[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<BillingCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [providersData, cptCodesData, icd10CodesData] = await Promise.all([
          fetchProviders(),
          fetchBillingCodes('CPT'),
          fetchBillingCodes('ICD10')
        ]);
        
        setProviders(providersData);
        setCptCodes(cptCodesData);
        setIcd10Codes(icd10CodesData);
      } catch (error) {
        console.error('Error fetching data for preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.name : 'Unknown Provider';
  };

  const getCodeDescription = (code: string, type: 'CPT' | 'ICD10') => {
    const codeList = type === 'CPT' ? cptCodes : icd10Codes;
    const codeObj = codeList.find(c => c.code === code);
    return codeObj ? codeObj.description : code;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient & Procedure Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Patient Name</h3>
              <p className="font-medium">{procedure.patient_name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">MRN</h3>
              <p className="font-medium">{procedure.mrn}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
              <p className="font-medium">
                {procedure.dob ? formatDate(procedure.dob) : (procedure.DOB ? formatDate(procedure.DOB) : 'N/A')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Procedure</h3>
              <p className="font-medium">{procedure.procedure_name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Laterality</h3>
              <p className="font-medium">{procedure.laterality || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p className="font-medium">{formatDate(procedure.date)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Authorization</h3>
              <p className="font-medium">{procedure.auth_number || procedure.AUTH || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Insurance</h3>
              <p className="font-medium">{procedure.insurance_company || procedure.COMP || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              <p className="font-medium">{procedure.location || 'Unassigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Case Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{summary.summary_text}</p>
          </CardContent>
        </Card>
      )}
      
      {billing && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Provider</h3>
              <p className="font-medium">{getProviderName(billing.provider_id)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">CPT Codes</h3>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {billing.billing_codes.map((codeObj, index) => {
                  const code = typeof codeObj === 'string' ? codeObj : codeObj.code;
                  const modifier = typeof codeObj === 'object' ? codeObj.modifier : undefined;
                  
                  return (
                    <li key={`${code}-${index}`}>
                      <span className="font-medium">{code}</span>
                      {modifier && <span className="ml-1 text-sm bg-muted px-1 rounded">{modifier}</span>}
                      <span className="ml-2 text-muted-foreground">
                        {getCodeDescription(code, 'CPT')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ICD-10 Codes</h3>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {billing.diagnosis_codes.map((code, index) => (
                  <li key={`${code}-${index}`}>
                    <span className="font-medium">{code}</span>
                    <span className="ml-2 text-muted-foreground">
                      {getCodeDescription(code, 'ICD10')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{report.report_text}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportPreview;
