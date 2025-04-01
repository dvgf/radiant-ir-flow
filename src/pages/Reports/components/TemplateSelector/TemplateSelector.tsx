
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Template } from '@/types';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onTemplateSelect: (templateId: string) => void;
  onApplyTemplate: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onApplyTemplate
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="template">Template</Label>
          <Select onValueChange={onTemplateSelect}>
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
            onClick={onApplyTemplate}
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
    </div>
  );
};

export default TemplateSelector;
