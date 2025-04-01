import React, { useState, useEffect } from 'react';
import { CaseBilling, BillingCode, Provider } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { fetchProviders, fetchBillingCodes } from '@/lib/supabase/providers-and-codes';
import { fetchTemplateCodeAssociations, loadTemplatesAndCodes } from '@/lib/supabase/template-codes';
import { Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BillingSectionProps {
  billing: CaseBilling;
  setBilling: React.Dispatch<React.SetStateAction<CaseBilling | null>>;
  procedureId: string;
  onComplete: (isComplete: boolean) => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({ 
  billing, 
  setBilling,
  procedureId,
  onComplete 
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cptCodes, setCptCodes] = useState<BillingCode[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<BillingCode[]>([]);
  const [selectedCptCodes, setSelectedCptCodes] = useState<Array<{code: string, modifier?: 'LT' | 'RT'}>>([]);
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cpt');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch providers
        setProvidersLoading(true);
        const providersData = await fetchProviders();
        console.log('Fetched providers:', providersData);
        setProviders(providersData);
        setProvidersLoading(false);
        
        // Then fetch codes
        const billingData = await loadTemplatesAndCodes();
        setCptCodes(billingData.billingCodes.cpt);
        setIcd10Codes(billingData.billingCodes.icd10);
        
        if (billing) {
          setSelectedCptCodes(billing.billing_codes || []);
          setSelectedIcd10Codes(billing.diagnosis_codes || []);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load provider or code data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [billing, toast]);

  useEffect(() => {
    setBilling(prev => {
      if (!prev) return null;
      
      const updatedBilling = {
        ...prev,
        billing_codes: selectedCptCodes,
        diagnosis_codes: selectedIcd10Codes,
        updated_at: new Date().toISOString()
      };
      
      const isComplete = Boolean(
        updatedBilling.provider_id && 
        updatedBilling.billing_codes.length > 0 && 
        updatedBilling.diagnosis_codes.length > 0
      );
      
      onComplete(isComplete);
      
      return updatedBilling;
    });
  }, [selectedCptCodes, selectedIcd10Codes, setBilling, onComplete]);

  const handleProviderChange = (providerId: string) => {
    console.log('Selected provider:', providerId);
    setBilling(prev => {
      if (!prev) return null;
      return {
        ...prev,
        provider_id: providerId,
        updated_at: new Date().toISOString()
      };
    });
  };

  const toggleCptCode = (code: string, modifier?: 'LT' | 'RT') => {
    setSelectedCptCodes(prev => {
      const existingIndex = prev.findIndex(c => 
        typeof c === 'string' ? c === code : c.code === code
      );
      
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        if (modifier) {
          return [...prev, { code, modifier }];
        } else {
          return [...prev, { code }];
        }
      }
    });
  };

  const toggleIcd10Code = (code: string) => {
    setSelectedIcd10Codes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const setModifier = (code: string, modifier: 'LT' | 'RT' | undefined) => {
    setSelectedCptCodes(prev => {
      return prev.map(c => {
        if (typeof c === 'string') {
          if (c === code) {
            return { code, modifier };
          }
          return { code: c };
        } else if (c.code === code) {
          return { ...c, modifier };
        }
        return c;
      });
    });
  };

  const isCptSelected = (code: string) => {
    return selectedCptCodes.some(c => 
      typeof c === 'string' ? c === code : c.code === code
    );
  };

  const getModifier = (code: string): 'LT' | 'RT' | undefined => {
    const selectedCode = selectedCptCodes.find(c => 
      typeof c === 'string' ? c === code : c.code === code
    );
    
    if (typeof selectedCode === 'object' && selectedCode) {
      return selectedCode.modifier;
    }
    
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="provider">Provider</Label>
        <Select
          value={billing.provider_id || ""}
          onValueChange={handleProviderChange}
          disabled={providersLoading}
        >
          <SelectTrigger id="provider" className="w-full">
            <SelectValue placeholder={providersLoading ? "Loading providers..." : "Select a provider"} />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-80 overflow-y-auto bg-background">
            {providersLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading providers...</span>
              </div>
            ) : providers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No providers available in database
              </div>
            ) : (
              providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name || `${provider.initials} (${provider.provider_id})`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="cpt">CPT Codes</TabsTrigger>
          <TabsTrigger value="icd10">ICD-10 Codes</TabsTrigger>
        </TabsList>
        
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
                        onValueChange={(value) => 
                          setModifier(code.code, value === "none" ? undefined : value as 'LT' | 'RT')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="bg-background">
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
                      onClick={() => toggleCptCode(code.code)}
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
                        onClick={() => toggleCptCode(code)}
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
                      onClick={() => toggleIcd10Code(code)}
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
    </div>
  );
};

export default BillingSection;
