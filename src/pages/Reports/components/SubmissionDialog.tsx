
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Procedure, CaseSummary, CaseReport, CaseBilling } from '@/types';
import { Loader2 } from 'lucide-react';
import { submitReport } from '@/lib/supabase/submissions';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure: Procedure;
  summary: CaseSummary | null;
  report: CaseReport | null;
  billing: CaseBilling | null;
  userId: string;
}

const SubmissionDialog: React.FC<SubmissionDialogProps> = ({
  open,
  onOpenChange,
  procedure,
  summary,
  report,
  billing,
  userId
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!procedure || !summary || !report || !billing) {
      toast({
        title: 'Missing Data',
        description: 'Some required data is missing. Please ensure all sections are complete.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare submission data
      const submissionData = {
        procedureId: procedure.id,
        userId,
        submissionType: 'Complete' as const,
        summaryText: summary.summary_text,
        reportText: report.report_text,
        billingData: {
          provider_id: billing.provider_id,
          billing_codes: billing.billing_codes,
          diagnosis_codes: billing.diagnosis_codes,
          operators: billing.operators
        },
        webhookUrl: procedure.webhook_url
      };
      
      // Submit the report
      await submitReport(submissionData);
      
      toast({
        title: 'Report Submitted',
        description: 'Your report has been successfully submitted.',
      });
      
      // Close the dialog and redirect
      onOpenChange(false);
      navigate('/worklist');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit the report. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Submission</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit this report? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium mb-2">The following will be submitted:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Case summary for {procedure?.patient_name}</li>
            <li>Billing information with {billing?.billing_codes.length || 0} code(s)</li>
            <li>Complete report document</li>
          </ul>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDialog;
