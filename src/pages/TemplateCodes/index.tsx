
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/Layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Tags as TagsIcon
} from 'lucide-react';
import { 
  loadTemplatesAndCodes, 
  fetchTemplateCodeAssociations,
  saveTemplateCodeAssociation,
  deleteTemplateCodeAssociation
} from '@/lib/supabase';
import { BillingCode, Template, TemplateCodeAssociation } from '@/types';

const TemplateCodes = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCodeType, setSelectedCodeType] = useState<'CPT' | 'ICD10'>('CPT');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [associations, setAssociations] = useState<TemplateCodeAssociation[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch templates and billing codes
  const { data: templateAndCodesData, isLoading: isLoadingTemplatesAndCodes } = useQuery({
    queryKey: ['templatesAndCodes'],
    queryFn: loadTemplatesAndCodes
  });

  // Fetch existing associations
  const { 
    data: associationsData, 
    isLoading: isLoadingAssociations,
    refetch: refetchAssociations 
  } = useQuery({
    queryKey: ['templateCodeAssociations'],
    queryFn: fetchTemplateCodeAssociations
  });

  useEffect(() => {
    if (associationsData) {
      setAssociations(associationsData);
    }
  }, [associationsData]);

  // Only admins should access this page
  if (user?.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access this page.',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  const templates = templateAndCodesData?.templates || [];
  const cptCodes = templateAndCodesData?.billingCodes.cpt || [];
  const icd10Codes = templateAndCodesData?.billingCodes.icd10 || [];

  const currentBillingCodes = selectedCodeType === 'CPT' ? cptCodes : icd10Codes;

  const handleAddAssociation = async () => {
    if (!selectedTemplate || !selectedCode) {
      toast({
        title: 'Missing information',
        description: 'Please select a template and a billing code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newAssociation: TemplateCodeAssociation = {
        template_id: selectedTemplate,
        code_id: selectedCode,
        code_type: selectedCodeType
      };

      await saveTemplateCodeAssociation(newAssociation);
      
      toast({
        title: 'Success',
        description: 'Template code association saved successfully.',
      });
      
      // Reset selected values
      setSelectedCode('');
      
      // Refresh associations
      refetchAssociations();
    } catch (error) {
      console.error('Error adding template code association:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template code association.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssociation = async (id: string) => {
    try {
      await deleteTemplateCodeAssociation(id);
      
      toast({
        title: 'Success',
        description: 'Template code association deleted successfully.',
      });
      
      // Refresh associations
      refetchAssociations();
    } catch (error) {
      console.error('Error deleting template code association:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template code association.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to find template name by ID
  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  // Helper function to find code by ID and type
  const getCodeDetails = (codeId: string, codeType: 'CPT' | 'ICD10') => {
    const codesArray = codeType === 'CPT' ? cptCodes : icd10Codes;
    const code = codesArray.find(c => c.id === codeId);
    return code ? `${code.code} - ${code.description}` : 'Unknown Code';
  };

  const isLoading = isLoadingTemplatesAndCodes || isLoadingAssociations;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Template Code Associations</h1>
        </div>

        <p className="text-muted-foreground">
          Associate templates with CPT and ICD10 billing codes for reporting and billing.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Add New Association</CardTitle>
            <CardDescription>
              Link templates to billing codes for standardized reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={selectedCodeType}
                  onValueChange={(value) => setSelectedCodeType(value as 'CPT' | 'ICD10')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Code Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPT">CPT</SelectItem>
                    <SelectItem value="ICD10">ICD10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={selectedCode}
                  onValueChange={setSelectedCode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentBillingCodes.map((code: BillingCode) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.code} - {code.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Button onClick={handleAddAssociation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Association
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Associations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
              </div>
            ) : associations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Code Type</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associations.map((association) => (
                    <TableRow key={association.id}>
                      <TableCell>{getTemplateName(association.template_id)}</TableCell>
                      <TableCell>{association.code_type}</TableCell>
                      <TableCell>{getCodeDetails(association.code_id, association.code_type)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => association.id && handleDeleteAssociation(association.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <TagsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No associations found. Create your first one above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TemplateCodes;
