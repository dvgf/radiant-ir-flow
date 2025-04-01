
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchProcedure, fetchCaseSummary, fetchCaseReport, fetchCaseBilling } from '@/lib/supabase';
import { saveCaseSummary, saveCaseReport, saveCaseBilling } from '@/lib/supabase';
import { Procedure, CaseSummary, CaseReport, CaseBilling } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Import our new components
import ProcedureDetails from './components/ProcedureDetails';
import CaseSummarySection from './components/CaseSummarySection';
import BillingSection from './components/BillingSection';
import ReportSection from './components/ReportSection';
import ReportPreview from './components/ReportPreview';
import SubmissionDialog from './components/SubmissionDialog';

const ReportEditor = () => {
  const { procedureId } = useParams<{ procedureId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [report, setReport] = useState<CaseReport | null>(null);
  const [billing, setBilling] = useState<CaseBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [previewMode, setPreviewMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const togglePreviewMode = () => {
    if (!previewMode) {
      // Save data before preview
      handleSave();
    }
    setPreviewMode(!previewMode);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!procedure) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p>Procedure not found.</p>
        </div>
      </AppLayout>
    );
  }

  if (previewMode) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Report Preview</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={togglePreviewMode}>
                Edit Report
              </Button>
              <Button 
                disabled={!summaryComplete || !billingComplete || !reportComplete}
                onClick={() => setDialogOpen(true)}
              >
                Submit Report
              </Button>
            </div>
          </div>
          
          <ReportPreview 
            procedure={procedure}
            summary={summary}
            report={report}
            billing={billing}
          />
          
          <SubmissionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            procedure={procedure}
            summary={summary}
            report={report}
            billing={billing}
            userId={user?.id || 'unknown'}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Report Editor</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save'}
            </Button>
            <Button 
              onClick={togglePreviewMode}
              disabled={!summaryComplete || !billingComplete || !reportComplete}
            >
              Preview
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="details">1. Procedure Details</TabsTrigger>
            <TabsTrigger value="summary" disabled={!procedure}>2. Case Summary</TabsTrigger>
            <TabsTrigger value="billing" disabled={!procedure || !summaryComplete}>3. Billing</TabsTrigger>
            <TabsTrigger value="report" disabled={!procedure || !summaryComplete || !billingComplete}>4. Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Procedure Details</CardTitle>
              </CardHeader>
              <CardContent>
                {procedure && <ProcedureDetails procedure={procedure} />}
              </CardContent>
            </Card>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab('summary')}>
                Next: Case Summary
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Case Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {procedure && summary && (
                  <CaseSummarySection
                    summary={summary}
                    setSummary={setSummary}
                    onComplete={(isComplete) => setSummaryComplete(isComplete)}
                  />
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab('details')}>
                Previous: Procedure Details
              </Button>
              <Button 
                onClick={() => setActiveTab('billing')}
                disabled={!summaryComplete}
              >
                Next: Billing
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                {procedure && billing && (
                  <BillingSection
                    billing={billing}
                    setBilling={setBilling}
                    procedureId={procedure.id}
                    onComplete={(isComplete) => setBillingComplete(isComplete)}
                  />
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab('summary')}>
                Previous: Case Summary
              </Button>
              <Button 
                onClick={() => setActiveTab('report')}
                disabled={!billingComplete}
              >
                Next: Report
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Report</CardTitle>
              </CardHeader>
              <CardContent>
                {procedure && report && (
                  <ReportSection
                    report={report}
                    setReport={setReport}
                    procedureId={procedure.id}
                    onComplete={(isComplete) => setReportComplete(isComplete)}
                  />
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab('billing')}>
                Previous: Billing
              </Button>
              <Button 
                onClick={togglePreviewMode}
                disabled={!reportComplete}
              >
                Preview Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportEditor;
