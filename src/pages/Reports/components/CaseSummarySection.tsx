
import React, { useEffect } from 'react';
import { CaseSummary } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CaseSummarySectionProps {
  summary: CaseSummary;
  setSummary: React.Dispatch<React.SetStateAction<CaseSummary | null>>;
  onComplete: (isComplete: boolean) => void;
}

const CaseSummarySection: React.FC<CaseSummarySectionProps> = ({ 
  summary, 
  setSummary,
  onComplete 
}) => {
  // Check if summary is complete
  useEffect(() => {
    const isComplete = Boolean(summary.summary_text && summary.summary_text.trim().length > 0);
    onComplete(isComplete);
  }, [summary.summary_text, onComplete]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        summary_text: e.target.value,
        updated_at: new Date().toISOString()
      };
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="summary" className="text-base">
          Case Summary
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Provide a comprehensive summary of the case.
        </p>
        <Textarea
          id="summary"
          value={summary.summary_text || ''}
          onChange={handleSummaryChange}
          placeholder="Enter case summary..."
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default CaseSummarySection;
