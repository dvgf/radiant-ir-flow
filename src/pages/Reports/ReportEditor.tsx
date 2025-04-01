
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchProcedure, fetchProviders, fetchCaseSummary, fetchCaseReport, fetchCaseBilling, fetchBillingCodes } from '@/lib/supabase';
import { Procedure, CaseSummary, CaseReport, CaseBilling, Provider, BillingCode, CaseStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CPTCode extends BillingCode {
  modifier?: 'LT' | 'RT';
}

const ReportEditor = () => {
  const { procedureId } = useParams<{ procedureId: string }>();
  const { toast } = useToast();

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [report, setReport] = useState<CaseReport | null>(null);
  const [billing, setBilling] = useState<CaseBilling | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [cptCodes, setCptCodes] = useState<BillingCode[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<BillingCode[]>([]);
  const [selectedCptCodes, setSelectedCptCodes] = useState<Array<{code: string, modifier?: 'LT' | 'RT'}>>([]);
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState<string[]>([]);
  const [operators, setOperators] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!procedureId) {
          throw new Error('Procedure ID is missing.');
        }

        const procedureData = await fetchProcedure(procedureId);
        const summaryData = await fetchCaseSummary(procedureId);
        const reportData = await fetchCaseReport(procedureId);
        const billingData = await fetchCaseBilling(procedureId);
        const providersData = await fetchProviders();
        const cptCodesData = await fetchBillingCodes('CPT');
        const icd10CodesData = await fetchBillingCodes('ICD10');

        setProcedure(procedureData);
        setSummary(summaryData);
        setReport(reportData);
        setBilling(billingData);
        setProviders(providersData);
        setCptCodes(cptCodesData);
        setIcd10Codes(icd10CodesData);

        if (billingData) {
          setSelectedProviderId(billingData.provider_id || '');
          setSelectedCptCodes(billingData.billing_codes || []);
          setSelectedIcd10Codes(billingData.diagnosis_codes || []);
          
          if (billingData.operators) {
            setOperators(billingData.operators);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data for this procedure.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [procedureId, toast]);

  if (!procedure) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Report Editor</h1>
          <Button>Save</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Procedure Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" value={procedure.patient_name} disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mrn">MRN</Label>
                <Input id="mrn" value={procedure.mrn} disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="procedureName">Procedure Name</Label>
                <Input id="procedureName" value={procedure.procedure_name} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="provider">Provider</Label>
                <Select 
                  value={selectedProviderId}
                  onValueChange={setSelectedProviderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.provider_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>CPT Codes</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Modifier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cptCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>{code.code}</TableCell>
                        <TableCell>{code.description}</TableCell>
                        <TableCell>
                          <Select defaultValue="none">
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="LT">LT</SelectItem>
                              <SelectItem value="RT">RT</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-1">
                <Label>ICD-10 Codes</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {icd10Codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>{code.code}</TableCell>
                        <TableCell>{code.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Enter report text here." value={report?.report_text || ''} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportEditor;
