
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useReportContext } from '../contexts/ReportContext';

interface ReportActionsProps {
  previewMode: boolean;
  togglePreviewMode: () => void;
  setDialogOpen: (open: boolean) => void;
}

const ReportActions: React.FC<ReportActionsProps> = ({ 
  previewMode, 
  togglePreviewMode, 
  setDialogOpen 
}) => {
  const { 
    saving, 
    handleSave, 
    summaryComplete, 
    billingComplete, 
    reportComplete 
  } = useReportContext();

  if (previewMode) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={togglePreviewMode}>
          Edit Report
        </Button>
        <Button 
          disabled={!summaryComplete || !billingComplete || !reportComplete}
          onClick={() => setDialogOpen(true)}
        >
          Submit Report
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : 'Save'}
      </Button>
      <Button 
        onClick={togglePreviewMode}
        disabled={!summaryComplete || !billingComplete || !reportComplete}
      >
        Preview
      </Button>
    </div>
  );
};

export default ReportActions;
