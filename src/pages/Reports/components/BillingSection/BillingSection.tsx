import React, { useState, useEffect } from 'react';
import { CaseBilling } from '@/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchProviders } from '@/lib/supabase/providers-and-codes';
import { loadTemplatesAndCodes } from '@/lib/supabase/template-codes';
import { useToast } from '@/hooks/use-toast';
import ProviderSelector from './ProviderSelector';
import CodingTables from './CodingTables';
import SelectedCodesList from './SelectedCodesList';

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
  const [activeTab, setActiveTab] = useState('cpt');
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);
  const { toast } = useToast();
  
  // Data states
  const [providers, setProviders] = useState([]);
  const [cptCodes, setCptCodes] = useState([]);
  const [icd10Codes, setIcd10Codes] = useState([]);
  
  // Selected codes state
  const [selectedCptCodes, setSelectedCptCodes] = useState([]);
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState([]);

  // Fetch data on component mount
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

  // Update billing state whenever selected codes change
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

  // Provider selection handler
  const handleProviderChange = (providerId) => {
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

  // CPT code selection handlers
  const toggleCptCode = (code, modifier) => {
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

  const setModifier = (code, modifier) => {
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

  const isCptSelected = (code) => {
    return selectedCptCodes.some(c => 
      typeof c === 'string' ? c === code : c.code === code
    );
  };

  const getModifier = (code) => {
    const selectedCode = selectedCptCodes.find(c => 
      typeof c === 'string' ? c === code : c.code === code
    );
    
    if (typeof selectedCode === 'object' && selectedCode) {
      return selectedCode.modifier;
    }
    
    return undefined;
  };

  // ICD10 code selection handler
  const toggleIcd10Code = (code) => {
    setSelectedIcd10Codes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  return (
    <div className="space-y-6">
      <ProviderSelector 
        providers={providers}
        selectedProviderId={billing?.provider_id || ""}
        onProviderChange={handleProviderChange}
        loading={providersLoading}
      />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="cpt">CPT Codes</TabsTrigger>
          <TabsTrigger value="icd10">ICD-10 Codes</TabsTrigger>
        </TabsList>
        
        <CodingTables 
          activeTab={activeTab}
          cptCodes={cptCodes}
          icd10Codes={icd10Codes}
          selectedCptCodes={selectedCptCodes}
          selectedIcd10Codes={selectedIcd10Codes}
          isCptSelected={isCptSelected}
          getModifier={getModifier}
          toggleCptCode={toggleCptCode}
          toggleIcd10Code={toggleIcd10Code}
          setModifier={setModifier}
        />
      </Tabs>

      <SelectedCodesList 
        selectedCptCodes={selectedCptCodes}
        selectedIcd10Codes={selectedIcd10Codes}
        toggleCptCode={toggleCptCode}
        toggleIcd10Code={toggleIcd10Code}
      />
    </div>
  );
};

export default BillingSection;
