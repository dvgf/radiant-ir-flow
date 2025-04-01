
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BillingSection from '../BillingSection';
import { useReportContext } from '../../contexts/ReportContext';

interface BillingTabContentProps {
  setActiveTab: (tab: string) => void;
}

const BillingTabContent: React.FC<BillingTabContentProps> = ({ setActiveTab }) => {
  const { 
    procedure, 
    billing, 
    setBilling, 
    billingComplete, 
    setBillingComplete 
  } = useReportContext();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          {procedure && billing && (
            <BillingSection
              billing={billing}
              setBilling={setBilling}
              procedureId={procedure.id}
              onComplete={(isComplete) => setBillingComplete(isComplete)}
            />
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setActiveTab('summary')}>
          Previous: Case Summary
        </Button>
        <Button 
          onClick={() => setActiveTab('report')}
          disabled={!billingComplete}
        >
          Next: Report
        </Button>
      </div>
    </>
  );
};

export default BillingTabContent;
