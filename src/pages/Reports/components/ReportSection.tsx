
import React, { useState, useEffect } from 'react';
import { CaseReport, Template } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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

  const applyTemplate = () => {
    if (!selectedTemplate) return;
    
    // For now, just use the template name as the report text
    // In a real application, you'd process the template's sections and variables
    setReport(prev => {
      if (!prev) return null;
      
      let templateText = `## ${selectedTemplate.name}\n\n`;
      
      // Add sections from the template
      if (selectedTemplate.sections && Array.isArray(selectedTemplate.sections)) {
        selectedTemplate.sections.forEach((section: any) => {
          if (section.title && section.content) {
            templateText += `### ${section.title}\n${section.content}\n\n`;
          }
        });
      }
      
      return {
        ...prev,
        report_text: templateText,
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
