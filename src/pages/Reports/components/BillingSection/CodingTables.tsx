
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { BillingCode } from '@/types';

interface CodingTablesProps {
  activeTab: string;
  cptCodes: BillingCode[];
  icd10Codes: BillingCode[];
  selectedCptCodes: Array<{code: string, modifier?: 'LT' | 'RT'} | string>;
  selectedIcd10Codes: string[];
  isCptSelected: (code: string) => boolean;
  getModifier: (code: string) => 'LT' | 'RT' | undefined;
  toggleCptCode: (code: string, modifier?: 'LT' | 'RT') => void;
  toggleIcd10Code: (code: string) => void;
  setModifier: (code: string, modifier: 'LT' | 'RT' | undefined) => void;
}

const CodingTables: React.FC<CodingTablesProps> = ({
  activeTab,
  cptCodes,
  icd10Codes,
  selectedCptCodes,
  selectedIcd10Codes,
  isCptSelected,
  getModifier,
  toggleCptCode,
  toggleIcd10Code,
  setModifier
}) => {
  // Handle CPT code selection
  const handleCptCodeSelect = (code: string) => {
    const modifier = getModifier(code);
    toggleCptCode(code, modifier);
  };
  
  // Handle modifier change
  const handleModifierChange = (code: string, value: string) => {
    setModifier(code, value === "none" ? undefined : value as 'LT' | 'RT');
  };

  return (
    <Tabs value={activeTab} defaultValue={activeTab}>
      <TabsContent value="cpt">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Modifier</TableHead>
              <TableHead className="w-[80px]">Select</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cptCodes.map((code) => (
              <TableRow key={code.id} className={isCptSelected(code.code) ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{code.code}</TableCell>
                <TableCell>{code.description}</TableCell>
                <TableCell>
                  {isCptSelected(code.code) && (
                    <Select
                      value={getModifier(code.code) || "none"}
                      onValueChange={(value) => handleModifierChange(code.code, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper" 
                        className="bg-background"
                        side="bottom"
                        align="start"
                      >
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="LT">LT</SelectItem>
                        <SelectItem value="RT">RT</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={isCptSelected(code.code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCptCodeSelect(code.code)}
                  >
                    {isCptSelected(code.code) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "Select"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      
      <TabsContent value="icd10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">Select</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {icd10Codes.map((code) => (
              <TableRow 
                key={code.id}
                className={selectedIcd10Codes.includes(code.code) ? "bg-muted/50" : ""}
              >
                <TableCell className="font-medium">{code.code}</TableCell>
                <TableCell>{code.description}</TableCell>
                <TableCell>
                  <Button
                    variant={selectedIcd10Codes.includes(code.code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleIcd10Code(code.code)}
                  >
                    {selectedIcd10Codes.includes(code.code) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "Select"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default CodingTables;
