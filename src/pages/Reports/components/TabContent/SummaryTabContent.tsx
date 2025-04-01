
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CaseSummarySection from '../CaseSummarySection';
import { useReportContext } from '../../contexts/ReportContext';

interface SummaryTabContentProps {
  setActiveTab: (tab: string) => void;
}

const SummaryTabContent: React.FC<SummaryTabContentProps> = ({ setActiveTab }) => {
  const { 
    procedure, 
    summary, 
    setSummary, 
    summaryComplete, 
    setSummaryComplete 
  } = useReportContext();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Case Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {procedure && summary && (
            <CaseSummarySection
              summary={summary}
              setSummary={setSummary}
              onComplete={(isComplete) => setSummaryComplete(isComplete)}
            />
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setActiveTab('details')}>
          Previous: Procedure Details
        </Button>
        <Button 
          onClick={() => setActiveTab('billing')}
          disabled={!summaryComplete}
        >
          Next: Billing
        </Button>
      </div>
    </>
  );
};

export default SummaryTabContent;
