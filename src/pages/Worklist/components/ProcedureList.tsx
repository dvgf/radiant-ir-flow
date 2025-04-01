
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Procedure, ReportStatus } from '@/types';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ProcedureDetails from './ProcedureDetails';

interface ProcedureListProps {
  procedures: Procedure[];
  onTechNotesChange: (id: string, notes: string) => void;
  techNotes: Record<string, string>;
  navigateToReport: (id: string) => void;
  userRole?: string;
}

const ProcedureList = ({ 
  procedures, 
  onTechNotesChange, 
  techNotes,
  navigateToReport,
  userRole
}: ProcedureListProps) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleExpandRow = (id: string) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const getReportStatus = (procedureId: string): ReportStatus => {
    const statuses: Record<string, ReportStatus> = {
      [procedureId]: 'Not Started',
    };
    
    return statuses[procedureId] || 'Not Started';
  };

  const renderReportStatusPill = (status: ReportStatus) => {
    let className = 'ir-status-pill ';
    
    switch (status) {
      case 'Complete':
        className += 'bg-green-900/30 text-green-200';
        break;
      case 'Summary Only':
        className += 'bg-amber-900/30 text-amber-200';
        break;
      case 'Submitted':
        className += 'bg-blue-900/30 text-blue-200';
        break;
      case 'Not Started':
      default:
        className += 'bg-gray-900/30 text-gray-200';
        break;
    }
    
    return <span className={className}>{status}</span>;
  };

  return (
    <div className="border rounded-md border-ir-border overflow-hidden">
      <table className="ir-table">
        <thead>
          <tr>
            <th className="w-8"></th>
            <th>Patient Name</th>
            <th>MRN</th>
            <th>Date</th>
            <th>Procedure</th>
            <th>Laterality</th>
            <th>Status</th>
            <th>Report Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {procedures.length > 0 ? (
            procedures.map((procedure) => {
              const isExpanded = expandedRows.includes(procedure.id);
              const reportStatus = getReportStatus(procedure.id);
              const formattedDate = procedure.date ? 
                new Date(procedure.date).toLocaleDateString() : 'N/A';
              
              return (
                <>
                  <tr key={procedure.id}>
                    <td>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpandRow(procedure.id)}
                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td>{procedure.patient_name}</td>
                    <td>{procedure.mrn}</td>
                    <td>{formattedDate}</td>
                    <td>{procedure.procedure_name}</td>
                    <td>{procedure.laterality}</td>
                    <td>
                      <span className={`ir-status-pill ir-status-${procedure.status.toLowerCase()}`}>
                        {procedure.status}
                      </span>
                    </td>
                    <td>{renderReportStatusPill(reportStatus)}</td>
                    <td className="text-right">
                      {(userRole === 'doctor' || userRole === 'admin') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToReport(procedure.id)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Report
                        </Button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="bg-ir-muted/30 p-0">
                        <ProcedureDetails
                          procedure={procedure}
                          onTechNotesChange={onTechNotesChange}
                          techNotes={techNotes}
                        />
                      </td>
                    </tr>
                  )}
                </>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-8">
                No procedures found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProcedureList;
