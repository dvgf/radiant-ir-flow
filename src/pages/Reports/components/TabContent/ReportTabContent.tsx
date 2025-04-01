
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReportSection from '../ReportSection';
import { useReportContext } from '../../contexts/ReportContext';

interface ReportTabContentProps {
  setActiveTab: (tab: string) => void;
  togglePreviewMode: () => void;
}

const ReportTabContent: React.FC<ReportTabContentProps> = ({ 
  setActiveTab, 
  togglePreviewMode 
}) => {
  const { 
    procedure, 
    report, 
    setReport, 
    reportComplete, 
    setReportComplete 
  } = useReportContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report</CardTitle>
      </CardHeader>
      <CardContent>
        {procedure && report && (
          <ReportSection
            report={report}
            setReport={setReport}
            procedureId={procedure.id}
            onComplete={(isComplete) => setReportComplete(isComplete)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ReportTabContent;
