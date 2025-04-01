
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SelectedCodesListProps {
  selectedCptCodes: Array<{code: string, modifier?: 'LT' | 'RT'} | string>;
  selectedIcd10Codes: string[];
  toggleCptCode: (code: string) => void;
  toggleIcd10Code: (code: string) => void;
}

const SelectedCodesList: React.FC<SelectedCodesListProps> = ({
  selectedCptCodes,
  selectedIcd10Codes,
  toggleCptCode,
  toggleIcd10Code
}) => {
  // Handle removing a CPT code
  const handleRemoveCpt = (code: string) => {
    toggleCptCode(code);
  };
  
  // Handle removing an ICD-10 code
  const handleRemoveIcd10 = (code: string) => {
    toggleIcd10Code(code);
  };

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium mb-2">Selected Codes</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">CPT Codes</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedCptCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No CPT codes selected</p>
            ) : (
              selectedCptCodes.map((codeObj, index) => {
                const code = typeof codeObj === 'string' ? codeObj : codeObj.code;
                const modifier = typeof codeObj === 'object' ? codeObj.modifier : undefined;
                
                return (
                  <div 
                    key={`${code}-${index}`}
                    className="bg-primary/10 text-primary rounded-md px-2 py-1 text-sm flex items-center gap-1"
                  >
                    {code}
                    {modifier && <span className="text-xs bg-primary/20 px-1 rounded">{modifier}</span>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => handleRemoveCpt(code)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">ICD-10 Codes</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedIcd10Codes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ICD-10 codes selected</p>
            ) : (
              selectedIcd10Codes.map((code, index) => (
                <div 
                  key={`${code}-${index}`}
                  className="bg-primary/10 text-primary rounded-md px-2 py-1 text-sm flex items-center gap-1"
                >
                  {code}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => handleRemoveIcd10(code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedCodesList;
