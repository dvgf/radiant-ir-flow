
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Import contexts
import { ReportProvider, useReportContext } from './contexts/ReportContext';

// Import components
import ReportActions from './components/ReportActions';
import ReportPreview from './components/ReportPreview';
import SubmissionDialog from './components/SubmissionDialog';
import {
  DetailsTabContent,
  SummaryTabContent,
  BillingTabContent,
  ReportTabContent
} from './components/TabContent';

const ReportEditorContent = () => {
  const { 
    procedure, 
    summary, 
    report, 
    billing, 
    loading 
  } = useReportContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [previewMode, setPreviewMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePreviewMode = () => {
    if (!previewMode) {
      useReportContext().handleSave();
    }
    setPreviewMode(!previewMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Procedure not found.</p>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Report Preview</h1>
          <ReportActions 
            previewMode={previewMode} 
            togglePreviewMode={togglePreviewMode} 
            setDialogOpen={setDialogOpen} 
          />
        </div>
        
        <ReportPreview 
          procedure={procedure}
          summary={summary}
          report={report}
          billing={billing}
        />
        
        <SubmissionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          procedure={procedure}
          summary={summary}
          report={report}
          billing={billing}
          userId={user?.id || 'unknown'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Report Editor</h1>
        <ReportActions 
          previewMode={previewMode} 
          togglePreviewMode={togglePreviewMode} 
          setDialogOpen={setDialogOpen} 
        />
      </div>

      <div className="space-y-8">
        {/* Procedure Details Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Procedure Details</h2>
          <DetailsTabContent setActiveTab={() => {}} />
        </div>
        
        {/* Case Summary Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Case Summary</h2>
          <SummaryTabContent setActiveTab={() => {}} />
        </div>
        
        {/* Billing Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
          <BillingTabContent setActiveTab={() => {}} />
        </div>
        
        {/* Report Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Report</h2>
          <ReportTabContent 
            setActiveTab={() => {}} 
            togglePreviewMode={togglePreviewMode} 
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={togglePreviewMode}
          disabled={!useReportContext().reportComplete}
        >
          Preview Report
        </Button>
      </div>
    </div>
  );
};

const ReportEditor = () => {
  return (
    <AppLayout>
      <ReportProvider>
        <ReportEditorContent />
      </ReportProvider>
    </AppLayout>
  );
};

export default ReportEditor;
