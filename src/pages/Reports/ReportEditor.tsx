
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, FileDown, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, fetchProviders, fetchBillingCodes, saveCaseSummary, saveCaseReport, saveCaseBilling, uploadReportPdf, deliverPdfToKeragon } from '@/lib/supabase';
import { Procedure, Provider, BillingCode, CaseSummary, CaseReport, CaseBilling } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const ReportEditor = () => {
  const { procedureId } = useParams<{ procedureId: string }>();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [reportLoaded, setReportLoaded] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cptCodes, setCptCodes] = useState<BillingCode[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<BillingCode[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedCptCodes, setSelectedCptCodes] = useState<{
    code: string;
    modifier?: 'LT' | 'RT';
  }[]>([]);
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState<string[]>([]);
  const [operators, setOperators] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!procedureId) return;

      try {
        setLoading(true);

        // Fetch procedure
        const { data: procedureData, error: procedureError } = await supabase
          .from('procedures')
          .select('*')
          .eq('id', procedureId)
          .single();

        if (procedureError) throw procedureError;
        setProcedure(procedureData);

        // Fetch providers
        const providersData = await fetchProviders();
        setProviders(providersData);
        
        // Default to first provider if available
        if (providersData.length > 0) {
          setSelectedProvider(providersData[0].id);
        }

        // Fetch CPT and ICD10 codes
        const cptData = await fetchBillingCodes('CPT');
        const icd10Data = await fetchBillingCodes('ICD10');
        setCptCodes(cptData);
        setIcd10Codes(icd10Data);

        // Fetch existing summary
        const { data: summaryData, error: summaryError } = await supabase
          .from('case_summaries')
          .select('*')
          .eq('procedure_id', procedureId)
          .maybeSingle();

        if (!summaryError && summaryData) {
          setSummary(summaryData.summary_text);
          setSummaryLoaded(true);
        }

        // Fetch existing report
        const { data: reportData, error: reportError } = await supabase
          .from('case_reports')
          .select('*')
          .eq('procedure_id', procedureId)
          .maybeSingle();

        if (!reportError && reportData) {
          setReport(reportData.report_text);
          setReportLoaded(true);
        }

        // Fetch existing billing
        const { data: billingData, error: billingError } = await supabase
          .from('case_billing')
          .select('*')
          .eq('procedure_id', procedureId)
          .maybeSingle();

        if (!billingError && billingData) {
          setSelectedProvider(billingData.provider_id);
          setSelectedCptCodes(billingData.billing_codes as any);
          setSelectedIcd10Codes(billingData.diagnosis_codes);
          setOperators(billingData.operators as Record<string, string>);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load report data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [procedureId, toast]);

  const handleSaveSummary = async () => {
    if (!procedureId || !user) return;

    try {
      setSaving(true);
      
      const summaryData: Partial<CaseSummary> = {
        procedure_id: procedureId,
        summary_text: summary,
        created_by: user.id,
      };
      
      await saveCaseSummary(summaryData);
      
      toast({
        title: 'Success',
        description: 'Case summary saved successfully.',
      });
      
      setSummaryLoaded(true);
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to save case summary.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReport = async () => {
    if (!procedureId || !user) return;

    try {
      setSaving(true);
      
      const reportData: Partial<CaseReport> = {
        procedure_id: procedureId,
        report_text: report,
        created_by: user.id,
      };
      
      await saveCaseReport(reportData);
      
      toast({
        title: 'Success',
        description: 'Case report saved successfully.',
      });
      
      setReportLoaded(true);
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to save case report.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCptCode = (code: string) => {
    if (selectedCptCodes.some(c => c.code === code)) {
      setSelectedCptCodes(selectedCptCodes.filter(c => c.code !== code));
    } else {
      setSelectedCptCodes([...selectedCptCodes, { code }]);
    }
  };

  const handleSetCptModifier = (code: string, modifier?: 'LT' | 'RT') => {
    setSelectedCptCodes(
      selectedCptCodes.map(c => 
        c.code === code ? { ...c, modifier } : c
      )
    );
  };

  const handleToggleIcd10Code = (code: string) => {
    if (selectedIcd10Codes.includes(code)) {
      setSelectedIcd10Codes(selectedIcd10Codes.filter(c => c !== code));
    } else {
      setSelectedIcd10Codes([...selectedIcd10Codes, code]);
    }
  };

  const handleOperatorChange = (role: string, value: string) => {
    setOperators({ ...operators, [role]: value });
  };

  const handleSubmitReport = async () => {
    if (!procedureId || !user || !procedure) return;
    
    try {
      setGenerating(true);
      
      // 1. Save the full report
      const reportData: Partial<CaseReport> = {
        procedure_id: procedureId,
        report_text: report,
        created_by: user.id,
      };
      
      const savedReport = await saveCaseReport(reportData);
      
      // 2. Save the billing information
      const billingData: Partial<CaseBilling> = {
        procedure_id: procedureId,
        billing_codes: selectedCptCodes,
        diagnosis_codes: selectedIcd10Codes,
        operators,
        provider_id: selectedProvider,
        created_by: user.id,
      };
      
      await saveCaseBilling(billingData);
      
      // 3. Generate PDF
      // For this demo, we'll simulate PDF generation
      // In a real app, use a library like jsPDF or a server-side solution
      const mockPdfBlob = new Blob(['PDF Content'], { type: 'application/pdf' });
      
      // 4. Upload PDF to Supabase Storage
      const pdfUrl = await uploadReportPdf(procedure.mrn, procedureId, mockPdfBlob);
      
      // 5. Update the report with the PDF URL
      await supabase
        .from('case_reports')
        .update({ pdf_url: pdfUrl })
        .eq('id', savedReport.id);
      
      // 6. Deliver to Keragon if webhook URL exists
      if (procedure.webhook_url) {
        await deliverPdfToKeragon(procedure.webhook_url, pdfUrl, procedureId);
      }
      
      toast({
        title: 'Success',
        description: 'Report submitted and PDF generated successfully.',
      });
      
      // Navigate back to worklist
      navigate('/worklist');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report and generate PDF.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!procedure) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Procedure not found. Please return to the worklist and try again.
          </AlertDescription>
          <Button
            onClick={() => navigate('/worklist')}
            className="mt-4 w-full"
            variant="default"
          >
            Return to Worklist
          </Button>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Report: {procedure.patient_name}
            </h1>
            <p className="text-muted-foreground">
              {procedure.procedure_name} ({procedure.laterality}) - MRN: {procedure.mrn}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/worklist')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Submit Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Case Summary</TabsTrigger>
            <TabsTrigger value="report">Full Report</TabsTrigger>
            <TabsTrigger value="billing">Coding & Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter a brief summary of the case..."
                  className="min-h-[200px]"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSaveSummary}
                    disabled={saving}
                    variant="secondary"
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Full Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter the complete procedure report..."
                  className="min-h-[400px]"
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                />
                <div className="flex justify-between mt-4">
                  <div>
                    {summaryLoaded && (
                      <Button
                        variant="outline"
                        onClick={() => setReport(`${report}\n\nSUMMARY:\n${summary}`)}
                        className="gap-2"
                      >
                        <FileDown className="h-4 w-4" />
                        Insert Summary
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleSaveReport}
                    disabled={saving}
                    variant="secondary"
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Provider & Operators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider of Record</label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Operator Roles</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs">Primary Operator</label>
                        <Select 
                          value={operators['primary'] || ''} 
                          onValueChange={(v) => handleOperatorChange('primary', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs">Assistant</label>
                        <Select 
                          value={operators['assistant'] || ''} 
                          onValueChange={(v) => handleOperatorChange('assistant', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assistant" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">CPT Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] overflow-y-auto pr-2 space-y-2">
                    {cptCodes.map((code) => {
                      const isSelected = selectedCptCodes.some(c => c.code === code.code);
                      const selectedCode = selectedCptCodes.find(c => c.code === code.code);
                      
                      return (
                        <div key={code.id} className="flex items-start space-x-2 p-2 rounded hover:bg-ir-muted/20">
                          <Checkbox
                            id={`cpt-${code.code}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleCptCode(code.code)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`cpt-${code.code}`}
                              className={`text-sm font-medium cursor-pointer ${isSelected ? 'text-ir-foreground' : 'text-ir-foreground/70'}`}
                            >
                              {code.code} - {code.description}
                            </label>
                            
                            {isSelected && procedure.laterality !== 'Bilateral' && (
                              <div className="mt-1 flex gap-2">
                                <Badge
                                  variant={selectedCode?.modifier === 'LT' ? 'default' : 'outline'}
                                  className="cursor-pointer"
                                  onClick={() => handleSetCptModifier(code.code, selectedCode?.modifier === 'LT' ? undefined : 'LT')}
                                >
                                  LT
                                </Badge>
                                <Badge
                                  variant={selectedCode?.modifier === 'RT' ? 'default' : 'outline'}
                                  className="cursor-pointer"
                                  onClick={() => handleSetCptModifier(code.code, selectedCode?.modifier === 'RT' ? undefined : 'RT')}
                                >
                                  RT
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">ICD-10 Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] overflow-y-auto pr-2 space-y-2">
                    {icd10Codes.map((code) => (
                      <div key={code.id} className="flex items-start space-x-2 p-2 rounded hover:bg-ir-muted/20">
                        <Checkbox
                          id={`icd10-${code.code}`}
                          checked={selectedIcd10Codes.includes(code.code)}
                          onCheckedChange={() => handleToggleIcd10Code(code.code)}
                        />
                        <label
                          htmlFor={`icd10-${code.code}`}
                          className={`text-sm font-medium flex-1 cursor-pointer ${
                            selectedIcd10Codes.includes(code.code) ? 'text-ir-foreground' : 'text-ir-foreground/70'
                          }`}
                        >
                          {code.code} - {code.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Codes Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">CPT Codes</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCptCodes.length > 0 ? (
                          selectedCptCodes.map((codeObj) => {
                            const codeData = cptCodes.find(c => c.code === codeObj.code);
                            return (
                              <Badge key={codeObj.code} variant="secondary" className="py-1 px-2">
                                {codeObj.code}
                                {codeObj.modifier && `-${codeObj.modifier}`}
                              </Badge>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No CPT codes selected</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">ICD-10 Codes</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedIcd10Codes.length > 0 ? (
                          selectedIcd10Codes.map((code) => (
                            <Badge key={code} variant="secondary" className="py-1 px-2">
                              {code}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No ICD-10 codes selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportEditor;
