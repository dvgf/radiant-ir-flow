
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProcedureDetails from '../ProcedureDetails';
import { useReportContext } from '../../contexts/ReportContext';

interface DetailsTabContentProps {
  setActiveTab: (tab: string) => void;
}

const DetailsTabContent: React.FC<DetailsTabContentProps> = ({ setActiveTab }) => {
  const { procedure } = useReportContext();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Procedure Details</CardTitle>
        </CardHeader>
        <CardContent>
          {procedure && <ProcedureDetails procedure={procedure} />}
        </CardContent>
      </Card>
      <div className="flex justify-end mt-4">
        <Button onClick={() => setActiveTab('summary')}>
          Next: Case Summary
        </Button>
      </div>
    </>
  );
};

export default DetailsTabContent;
