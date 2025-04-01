
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import { TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Import contexts
import { ReportProvider, useReportContext } from './contexts/ReportContext';

// Import components
import ReportTabs from './components/ReportTabs';
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
  
  const [activeTab, setActiveTab] = useState('details');
  const [previewMode, setPreviewMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePreviewMode = () => {
    if (!previewMode) {
      // Save data before preview
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Report Editor</h1>
        <ReportActions 
          previewMode={previewMode} 
          togglePreviewMode={togglePreviewMode} 
          setDialogOpen={setDialogOpen} 
        />
      </div>

      <ReportTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <TabsContent value="details">
        <DetailsTabContent setActiveTab={setActiveTab} />
      </TabsContent>
      
      <TabsContent value="summary">
        <SummaryTabContent setActiveTab={setActiveTab} />
      </TabsContent>
      
      <TabsContent value="billing">
        <BillingTabContent setActiveTab={setActiveTab} />
      </TabsContent>
      
      <TabsContent value="report">
        <ReportTabContent 
          setActiveTab={setActiveTab} 
          togglePreviewMode={togglePreviewMode} 
        />
      </TabsContent>
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
