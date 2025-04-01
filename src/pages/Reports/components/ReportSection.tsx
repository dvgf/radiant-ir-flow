
import React, { useState, useEffect } from 'react';
import { CaseReport, Template } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchTemplates } from '@/lib/supabase/templates';

interface ReportSectionProps {
  report: CaseReport;
  setReport: React.Dispatch<React.SetStateAction<CaseReport | null>>;
  procedureId: string;
  onComplete: (isComplete: boolean) => void;
}

const ReportSection: React.FC<ReportSectionProps> = ({ 
  report, 
  setReport,
  procedureId,
  onComplete 
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [variables, setVariables] = useState<{[key: string]: string}>({});

  // Load templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const templatesData = await fetchTemplates();
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if report is complete
  useEffect(() => {
    const isComplete = Boolean(report.report_text && report.report_text.trim().length > 0);
    onComplete(isComplete);
  }, [report.report_text, onComplete]);

  // Extract variables from the template when selected
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.variables) {
      const extractedVariables: {[key: string]: string} = {};
      
      // Initialize variables from the template
      if (Array.isArray(selectedTemplate.variables)) {
        selectedTemplate.variables.forEach((variable: any) => {
          if (typeof variable === 'object' && variable.name) {
            extractedVariables[variable.name] = variable.default || '';
          } else if (typeof variable === 'string') {
            extractedVariables[variable] = '';
          }
        });
      }
      
      setVariables(extractedVariables);
    }
  }, [selectedTemplate]);

  const handleReportChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReport(prev => {
      if (!prev) return null;
      return {
        ...prev,
        report_text: e.target.value,
        updated_at: new Date().toISOString()
      };
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyTemplate = () => {
    if (!selectedTemplate) return;
    
    let templateText = `## ${selectedTemplate.name}\n\n`;
    
    // Add sections from the template
    if (selectedTemplate.sections && Array.isArray(selectedTemplate.sections)) {
      selectedTemplate.sections.forEach((section: any) => {
        if (section.title && section.content) {
          let sectionContent = section.content;
          
          // Replace variables in the content
          Object.entries(variables).forEach(([name, value]) => {
            const variablePattern = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
            sectionContent = sectionContent.replace(variablePattern, value);
          });
          
          templateText += `### ${section.title}\n${sectionContent}\n\n`;
        }
      });
    }
    
    setReport(prev => {
      if (!prev) return null;
      return {
        ...prev,
        report_text: templateText,
        updated_at: new Date().toISOString()
      };
    });
  };

  const fillVariableInReportText = (name: string, value: string) => {
    if (!report.report_text) return;

    const variablePattern = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
    const updatedText = report.report_text.replace(variablePattern, value);
    
    setReport(prev => {
      if (!prev) return null;
      return {
        ...prev,
        report_text: updatedText,
        updated_at: new Date().toISOString()
      };
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="template">Template</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger id="template">
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
            </div>
            <div className="flex items-end">
              <Button 
                onClick={applyTemplate}
                disabled={!selectedTemplate}
              >
                Apply Template
              </Button>
            </div>
          </div>
          
          {selectedTemplate && (
            <div>
              <Label>Template Details</Label>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p><strong>Name:</strong> {selectedTemplate.name}</p>
                <p><strong>Category:</strong> {selectedTemplate.category}</p>
                <p><strong>Description:</strong> {selectedTemplate.description}</p>
              </div>
            </div>
          )}
          
          {/* Variables Section */}
          {selectedTemplate && Object.keys(variables).length > 0 && (
            <div className="space-y-3">
              <Label>Template Variables</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(variables).map(([name, value]) => (
                  <div key={name} className="space-y-1">
                    <Label htmlFor={`var-${name}`}>{name}</Label>
                    <div className="flex gap-2">
                      <Input 
                        id={`var-${name}`}
                        value={value}
                        onChange={(e) => handleVariableChange(name, e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fillVariableInReportText(name, value)}
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div>
        <Label htmlFor="report" className="text-base">
          Report Content
        </Label>
        <Textarea
          id="report"
          value={report.report_text || ''}
          onChange={handleReportChange}
          placeholder="Enter report content..."
          className="min-h-[400px] font-mono"
        />
      </div>
    </div>
  );
};

export default ReportSection;
