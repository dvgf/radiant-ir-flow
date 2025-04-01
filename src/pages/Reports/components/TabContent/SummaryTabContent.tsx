
import React from 'react';
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
  );
};

export default SummaryTabContent;
