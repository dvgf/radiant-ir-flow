
import React from 'react';
import { Procedure } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProcedureDetailsProps {
  procedure: Procedure;
}

const ProcedureDetails: React.FC<ProcedureDetailsProps> = ({ procedure }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Patient Name</h3>
            <p className="text-lg font-semibold">{procedure.patient_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">MRN</h3>
            <p className="text-lg font-semibold">{procedure.mrn}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
            <p className="text-lg font-semibold">
              {procedure.dob ? formatDate(procedure.dob) : (procedure.DOB ? formatDate(procedure.DOB) : 'N/A')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Procedure</h3>
            <p className="text-lg font-semibold">{procedure.procedure_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Laterality</h3>
            <p className="text-lg font-semibold">{procedure.laterality || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Authorization Number</h3>
            <p className="text-lg font-semibold">{procedure.auth_number || procedure.AUTH || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
            <p className="text-lg font-semibold">{formatDate(procedure.date)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Insurance</h3>
            <p className="text-lg font-semibold">{procedure.insurance_company || procedure.COMP || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
            <p className="text-lg font-semibold">{procedure.location || 'Unassigned'}</p>
          </div>
        </CardContent>
      </Card>
      
      {procedure.line1_full && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
            <p className="whitespace-pre-wrap">{procedure.line1_full}</p>
          </CardContent>
        </Card>
      )}
      
      {procedure.tech_notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Technologist Notes</h3>
            <p className="whitespace-pre-wrap">{procedure.tech_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcedureDetails;
