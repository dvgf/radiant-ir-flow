
import { useState } from 'react';
import { Procedure } from '@/types';

interface ProcedureDetailsProps {
  procedure: Procedure;
  onTechNotesChange: (id: string, notes: string) => void;
  techNotes: Record<string, string>;
}

const ProcedureDetails = ({ 
  procedure, 
  onTechNotesChange, 
  techNotes 
}: ProcedureDetailsProps) => {
  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-ir-foreground/70">DOB</p>
          <p className="text-sm">{procedure.dob || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-ir-foreground/70">Location</p>
          <p className="text-sm">{procedure.location || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-ir-foreground/70">AUTH</p>
          <p className="text-sm">{procedure.auth_number || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-ir-foreground/70">COMP</p>
          <p className="text-sm">{procedure.insurance_company || 'N/A'}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-ir-foreground/70">Notes</p>
          <p className="text-sm">{procedure.line1_full || 'N/A'}</p>
        </div>
      </div>
      
      <div>
        <p className="text-xs text-ir-foreground/70 mb-1">Technologist Notes</p>
        <textarea
          rows={3}
          className="w-full rounded-md bg-ir-muted/50 border border-ir-border p-2 text-sm"
          placeholder="Add technologist notes here..."
          value={techNotes[procedure.id] || ''}
          onChange={(e) => onTechNotesChange(procedure.id, e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProcedureDetails;
