
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Template, BillingCode, TemplateCodeAssociation } from '@/types';
import { 
  fetchTemplateCodeAssociations, 
  saveTemplateCodeAssociation, 
  deleteTemplateCodeAssociation,
  loadTemplatesAndCodes 
} from '@/lib/supabase/template-codes';

export default function TemplateCodes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [cptCodes, setCptCodes] = useState<BillingCode[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<BillingCode[]>([]);
  const [associations, setAssociations] = useState<TemplateCodeAssociation[]>([]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCptCode, setSelectedCptCode] = useState<string>('');
  const [selectedIcd10Code, setSelectedIcd10Code] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('cpt');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { templates, billingCodes } = await loadTemplatesAndCodes();
        const associations = await fetchTemplateCodeAssociations();
        
        setTemplates(templates);
        setCptCodes(billingCodes.cpt);
        setIcd10Codes(billingCodes.icd10);
        setAssociations(associations);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load templates and codes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [toast]);

  const handleAssociateCptCode = async () => {
    if (!selectedTemplate || !selectedCptCode) {
      toast({
        title: 'Error',
        description: 'Please select both a template and a CPT code',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newAssociation: TemplateCodeAssociation = {
        template_id: selectedTemplate,
        code_id: selectedCptCode,
        code_type: 'CPT'
      };
      
      await saveTemplateCodeAssociation(newAssociation);
      const updatedAssociations = await fetchTemplateCodeAssociations();
      setAssociations(updatedAssociations);
      
      toast({
        title: 'Success',
        description: 'CPT code associated with template',
      });
      
      setSelectedCptCode('');
    } catch (error) {
      console.error('Error associating CPT code:', error);
      toast({
        title: 'Error',
        description: 'Failed to associate CPT code',
        variant: 'destructive',
      });
    }
  };

  const handleAssociateIcd10Code = async () => {
    if (!selectedTemplate || !selectedIcd10Code) {
      toast({
        title: 'Error',
        description: 'Please select both a template and an ICD-10 code',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newAssociation: TemplateCodeAssociation = {
        template_id: selectedTemplate,
        code_id: selectedIcd10Code,
        code_type: 'ICD10'
      };
      
      await saveTemplateCodeAssociation(newAssociation);
      const updatedAssociations = await fetchTemplateCodeAssociations();
      setAssociations(updatedAssociations);
      
      toast({
        title: 'Success',
        description: 'ICD-10 code associated with template',
      });
      
      setSelectedIcd10Code('');
    } catch (error) {
      console.error('Error associating ICD-10 code:', error);
      toast({
        title: 'Error',
        description: 'Failed to associate ICD-10 code',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssociation = async (id: string) => {
    try {
      await deleteTemplateCodeAssociation(id);
      setAssociations(associations.filter(a => a.id !== id));
      
      toast({
        title: 'Success',
        description: 'Association removed',
      });
    } catch (error) {
      console.error('Error deleting association:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove association',
        variant: 'destructive',
      });
    }
  };

  const getTemplateNameById = (id: string) => {
    const template = templates.find(t => t.id === id);
    return template?.name || 'Unknown Template';
  };

  const getCodeById = (id: string, type: 'CPT' | 'ICD10') => {
    const codes = type === 'CPT' ? cptCodes : icd10Codes;
    const code = codes.find(c => c.id === id);
    return code ? `${code.code} - ${code.description}` : 'Unknown Code';
  };

  const filteredAssociations = associations.filter(
    a => a.template_id === selectedTemplate && a.code_type === activeTab.toUpperCase()
  );

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Template Code Associations</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
              <CardDescription>Choose a template to associate with codes</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {selectedTemplate && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cpt">CPT Codes</TabsTrigger>
                <TabsTrigger value="icd10">ICD-10 Codes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cpt">
                <Card>
                  <CardHeader>
                    <CardTitle>Associate CPT Code</CardTitle>
                    <CardDescription>Link a CPT code to the selected template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cptCode">CPT Code</Label>
                        <Select value={selectedCptCode} onValueChange={setSelectedCptCode}>
                          <SelectTrigger id="cptCode" className="w-full">
                            <SelectValue placeholder="Select a CPT code" />
                          </SelectTrigger>
                          <SelectContent>
                            {cptCodes.map((code) => (
                              <SelectItem key={code.id} value={code.id}>
                                {code.code} - {code.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleAssociateCptCode}>
                        Associate CPT Code
                      </Button>
                    </div>
                    
                    {filteredAssociations.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Associated CPT Codes</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAssociations.map((assoc) => (
                              <TableRow key={assoc.id}>
                                <TableCell>{getCodeById(assoc.code_id, 'CPT')}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => assoc.id && handleDeleteAssociation(assoc.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="icd10">
                <Card>
                  <CardHeader>
                    <CardTitle>Associate ICD-10 Code</CardTitle>
                    <CardDescription>Link an ICD-10 code to the selected template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="icd10Code">ICD-10 Code</Label>
                        <Select value={selectedIcd10Code} onValueChange={setSelectedIcd10Code}>
                          <SelectTrigger id="icd10Code" className="w-full">
                            <SelectValue placeholder="Select an ICD-10 code" />
                          </SelectTrigger>
                          <SelectContent>
                            {icd10Codes.map((code) => (
                              <SelectItem key={code.id} value={code.id}>
                                {code.code} - {code.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleAssociateIcd10Code}>
                        Associate ICD-10 Code
                      </Button>
                    </div>
                    
                    {filteredAssociations.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Associated ICD-10 Codes</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAssociations.map((assoc) => (
                              <TableRow key={assoc.id}>
                                <TableCell>{getCodeById(assoc.code_id, 'ICD10')}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => assoc.id && handleDeleteAssociation(assoc.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          {loading && <p className="text-center">Loading...</p>}
        </div>
      </div>
    </AppLayout>
  );
}
