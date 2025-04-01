
import { Template } from '@/types';

/**
 * Extract variables and their options from a template
 */
export const extractTemplateVariables = (template: Template | null) => {
  if (!template || !template.variables) {
    return { variables: {}, variableOptions: {} };
  }

  const extractedVariables: {[key: string]: string} = {};
  const extractedOptions: {[key: string]: string[]} = {};
  
  // Initialize variables from the template
  if (Array.isArray(template.variables)) {
    template.variables.forEach((variable: any) => {
      if (typeof variable === 'object' && variable.name) {
        extractedVariables[variable.name] = variable.default || '';
        
        // Extract options if available
        if (variable.options && Array.isArray(variable.options)) {
          // Ensure options are strings, not objects
          const stringOptions = variable.options.map((option: any) => {
            if (typeof option === 'string') return option;
            if (typeof option === 'object' && option.value) return option.value;
            return String(option);
          });
          extractedOptions[variable.name] = stringOptions;
        }
      } else if (typeof variable === 'string') {
        extractedVariables[variable] = '';
      }
    });
  }
  
  return { variables: extractedVariables, variableOptions: extractedOptions };
};

/**
 * Apply template with variables to generate report text
 */
export const generateTemplateText = (
  template: Template, 
  variables: {[key: string]: string}
): string => {
  if (!template) return '';
  
  let templateText = `## ${template.name}\n\n`;
  
  // Add sections from the template
  if (template.sections && Array.isArray(template.sections)) {
    template.sections.forEach((section: any) => {
      if (section.title && section.content) {
        let sectionContent = section.content;
        
        // Replace variables in the content
        Object.entries(variables).forEach(([name, value]) => {
          const variablePattern = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
          sectionContent = sectionContent.replace(variablePattern, value || `{{${name}}}`);
        });
        
        templateText += `### ${section.title}\n${sectionContent}\n\n`;
      }
    });
  }
  
  return templateText;
};

/**
 * Replace a specific variable in report text
 */
export const replaceVariableInText = (
  text: string, 
  variableName: string, 
  value: string
): string => {
  if (!text) return '';
  
  const variablePattern = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
  return text.replace(variablePattern, value);
};
