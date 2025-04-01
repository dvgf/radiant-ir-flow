
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProcedure, fetchCaseSummary, fetchCaseReport, fetchCaseBilling } from '@/lib/supabase';
import { saveCaseSummary, saveCaseReport, saveCaseBilling } from '@/lib/supabase';
import { Procedure, CaseSummary, CaseReport, CaseBilling } from '@/types';

interface ReportContextType {
  procedure: Procedure | null;
  summary: CaseSummary | null;
  report: CaseReport | null;
  billing: CaseBilling | null;
  loading: boolean;
  saving: boolean;
  summaryComplete: boolean;
  billingComplete: boolean;
  reportComplete: boolean;
  setSummary: React.Dispatch<React.SetStateAction<CaseSummary | null>>;
  setReport: React.Dispatch<React.SetStateAction<CaseReport | null>>;
  setBilling: React.Dispatch<React.SetStateAction<CaseBilling | null>>;
  setSummaryComplete: (complete: boolean) => void;
  setBillingComplete: (complete: boolean) => void;
  setReportComplete: (complete: boolean) => void;
  handleSave: () => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const { procedureId } = useParams<{ procedureId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [report, setReport] = useState<CaseReport | null>(null);
  const [billing, setBilling] = useState<CaseBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Validation states
  const [summaryComplete, setSummaryComplete] = useState(false);
  const [billingComplete, setBillingComplete] = useState(false);
  const [reportComplete, setReportComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!procedureId) {
          throw new Error('Procedure ID is missing.');
        }

        setLoading(true);
        const procedureData = await fetchProcedure(procedureId);
        const summaryData = await fetchCaseSummary(procedureId);
        const reportData = await fetchCaseReport(procedureId);
        const billingData = await fetchCaseBilling(procedureId);

        setProcedure(procedureData);
        setSummary(summaryData || {
          id: '',
          procedure_id: procedureId,
          summary_text: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || 'system',
          mrn: procedureData.mrn
        });
        
        setReport(reportData || {
          id: '',
          procedure_id: procedureId,
          report_text: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || 'system'
        });
        
        setBilling(billingData || {
          id: '',
          procedure_id: procedureId,
          billing_codes: [],
          diagnosis_codes: [],
          operators: {},
          provider_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || 'system',
          mrn: procedureData.mrn
        });

        // Check if sections are complete
        if (summaryData?.summary_text) setSummaryComplete(true);
        if (billingData?.provider_id && 
            billingData.billing_codes.length > 0 && 
            billingData.diagnosis_codes.length > 0) {
          setBillingComplete(true);
        }
        if (reportData?.report_text) setReportComplete(true);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data for this procedure.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [procedureId, toast, user?.id]);

  const handleSave = async () => {
    if (!procedure || !user) return;
    
    try {
      setSaving(true);
      
      // Save summary
      if (summary) {
        await saveCaseSummary({
          ...summary,
          created_by: summary.created_by || user.id,
        });
      }
      
      // Save report
      if (report) {
        await saveCaseReport({
          ...report,
          created_by: report.created_by || user.id,
        });
      }
      
      // Save billing
      if (billing) {
        await saveCaseBilling({
          ...billing,
          created_by: billing.created_by || user.id,
        });
      }
      
      toast({
        title: 'Success',
        description: 'Report data saved successfully.',
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save report data.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const value = {
    procedure,
    summary,
    report,
    billing,
    loading,
    saving,
    summaryComplete,
    billingComplete,
    reportComplete,
    setSummary,
    setReport,
    setBilling,
    setSummaryComplete,
    setBillingComplete,
    setReportComplete,
    handleSave
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};
