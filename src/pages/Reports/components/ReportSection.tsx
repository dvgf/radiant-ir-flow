
import React, { useState, useEffect } from 'react';
import { CaseReport, Template } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTemplates } from '@/lib/supabase/templates';
import TemplateSelector from './TemplateSelector';
import TemplateVariables from './TemplateVariables';
import { extractTemplateVariables, generateTemplateText, replaceVariableInText } from '../utils/templateUtils';

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
  const [variableOptions, setVariableOptions] = useState<{[key: string]: string[]}>({});

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

  // Extract variables and their options from the template when selected
  useEffect(() => {
    if (selectedTemplate) {
      const { variables: extractedVars, variableOptions: extractedOpts } = 
        extractTemplateVariables(selectedTemplate);
      
      setVariables(extractedVars);
      setVariableOptions(extractedOpts);
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
    
    let templateText = generateTemplateText(selectedTemplate, variables);
    
    // Set the report text with the template
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

    const updatedText = replaceVariableInText(report.report_text, name, value);
    
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
          <TemplateSelector 
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            onApplyTemplate={applyTemplate}
          />
          
          {/* Variables Section */}
          {selectedTemplate && Object.keys(variables).length > 0 && (
            <TemplateVariables 
              variables={variables}
              variableOptions={variableOptions}
              onVariableChange={handleVariableChange}
              onInsertVariable={fillVariableInReportText}
            />
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
