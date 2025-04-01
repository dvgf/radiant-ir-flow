
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  const [selectedCptCodes, setSelectedCptCodes] = useState<string[]>([]);
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState<string[]>([]);
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

  useEffect(() => {
    // Reset selected code arrays when template changes
    setSelectedCptCodes([]);
    setSelectedIcd10Codes([]);
  }, [selectedTemplate]);

  const toggleCptCode = (codeId: string) => {
    setSelectedCptCodes(prev => 
      prev.includes(codeId) ? prev.filter(id => id !== codeId) : [...prev, codeId]
    );
  };

  const toggleIcd10Code = (codeId: string) => {
    setSelectedIcd10Codes(prev => 
      prev.includes(codeId) ? prev.filter(id => id !== codeId) : [...prev, codeId]
    );
  };

  const handleAssociateCptCodes = async () => {
    if (!selectedTemplate || selectedCptCodes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select both a template and at least one CPT code',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save all selected CPT codes
      for (const codeId of selectedCptCodes) {
        const newAssociation: TemplateCodeAssociation = {
          template_id: selectedTemplate,
          code_id: codeId,
          code_type: 'CPT'
        };
        
        await saveTemplateCodeAssociation(newAssociation);
      }
      
      const updatedAssociations = await fetchTemplateCodeAssociations();
      setAssociations(updatedAssociations);
      
      toast({
        title: 'Success',
        description: 'CPT codes associated with template',
      });
      
      setSelectedCptCodes([]);
    } catch (error) {
      console.error('Error associating CPT codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to associate CPT codes',
        variant: 'destructive',
      });
    }
  };

  const handleAssociateIcd10Codes = async () => {
    if (!selectedTemplate || selectedIcd10Codes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select both a template and at least one ICD-10 code',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save all selected ICD-10 codes
      for (const codeId of selectedIcd10Codes) {
        const newAssociation: TemplateCodeAssociation = {
          template_id: selectedTemplate,
          code_id: codeId,
          code_type: 'ICD10'
        };
        
        await saveTemplateCodeAssociation(newAssociation);
      }
      
      const updatedAssociations = await fetchTemplateCodeAssociations();
      setAssociations(updatedAssociations);
      
      toast({
        title: 'Success',
        description: 'ICD-10 codes associated with template',
      });
      
      setSelectedIcd10Codes([]);
    } catch (error) {
      console.error('Error associating ICD-10 codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to associate ICD-10 codes',
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
                    <CardTitle>Associate CPT Codes</CardTitle>
                    <CardDescription>Select CPT codes to link to the selected template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cptCodes.map((code) => (
                          <div key={code.id} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`cpt-${code.id}`} 
                              checked={selectedCptCodes.includes(code.id)}
                              onCheckedChange={() => toggleCptCode(code.id)}
                            />
                            <Label 
                              htmlFor={`cpt-${code.id}`}
                              className="text-sm leading-tight cursor-pointer"
                            >
                              {code.code} - {code.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={handleAssociateCptCodes}
                        disabled={selectedCptCodes.length === 0}
                      >
                        Associate Selected CPT Codes
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
                    <CardTitle>Associate ICD-10 Codes</CardTitle>
                    <CardDescription>Select ICD-10 codes to link to the selected template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {icd10Codes.map((code) => (
                          <div key={code.id} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`icd10-${code.id}`} 
                              checked={selectedIcd10Codes.includes(code.id)}
                              onCheckedChange={() => toggleIcd10Code(code.id)}
                            />
                            <Label 
                              htmlFor={`icd10-${code.id}`}
                              className="text-sm leading-tight cursor-pointer"
                            >
                              {code.code} - {code.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={handleAssociateIcd10Codes}
                        disabled={selectedIcd10Codes.length === 0}
                      >
                        Associate Selected ICD-10 Codes
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
