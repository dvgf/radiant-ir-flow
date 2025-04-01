
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TemplateVariablesProps {
  variables: {[key: string]: string};
  variableOptions: {[key: string]: string[]};
  onVariableChange: (name: string, value: string) => void;
  onInsertVariable: (name: string, value: string) => void;
}

const TemplateVariables: React.FC<TemplateVariablesProps> = ({
  variables,
  variableOptions,
  onVariableChange,
  onInsertVariable
}) => {
  if (Object.keys(variables).length === 0) {
    return null;
  }

  // Render variable input field or radio buttons based on options availability
  const renderVariableInput = (name: string, value: string) => {
    const options = variableOptions[name];
    
    if (options && options.length > 0) {
      return (
        <RadioGroup 
          value={value} 
          onValueChange={(newValue) => onVariableChange(name, newValue)}
          className="space-y-1"
        >
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${name}-${option}`} />
              <Label htmlFor={`${name}-${option}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }
    
    return (
      <Input 
        id={`var-${name}`}
        value={value}
        onChange={(e) => onVariableChange(name, e.target.value)}
        className="flex-1"
      />
    );
  };

  return (
    <div className="space-y-3">
      <Label>Template Variables</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(variables).map(([name, value]) => (
          <div key={name} className="space-y-1">
            <Label htmlFor={`var-${name}`}>{name}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                {renderVariableInput(name, value)}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onInsertVariable(name, value)}
              >
                Insert
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateVariables;
