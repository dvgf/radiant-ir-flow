
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReportContext } from '../contexts/ReportContext';

interface ReportTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, setActiveTab }) => {
  const { procedure, summaryComplete, billingComplete } = useReportContext();

  return (
    <TabsList className="grid grid-cols-4 w-full">
      <TabsTrigger value="details">1. Procedure Details</TabsTrigger>
      <TabsTrigger value="summary" disabled={!procedure}>2. Case Summary</TabsTrigger>
      <TabsTrigger value="billing" disabled={!procedure || !summaryComplete}>3. Billing</TabsTrigger>
      <TabsTrigger value="report" disabled={!procedure || !summaryComplete || !billingComplete}>4. Report</TabsTrigger>
    </TabsList>
  );
};

export default ReportTabs;
