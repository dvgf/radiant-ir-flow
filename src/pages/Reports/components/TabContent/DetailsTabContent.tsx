
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProcedureDetails from '../ProcedureDetails';
import { useReportContext } from '../../contexts/ReportContext';

interface DetailsTabContentProps {
  setActiveTab: (tab: string) => void;
}

const DetailsTabContent: React.FC<DetailsTabContentProps> = ({ setActiveTab }) => {
  const { procedure } = useReportContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procedure Details</CardTitle>
      </CardHeader>
      <CardContent>
        {procedure && <ProcedureDetails procedure={procedure} />}
      </CardContent>
    </Card>
  );
};

export default DetailsTabContent;
