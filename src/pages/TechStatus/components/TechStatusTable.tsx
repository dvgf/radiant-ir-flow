
import { useState } from 'react';
import { Procedure, CaseStatus } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TechStatusTableProps {
  procedures: Procedure[];
  loading: boolean;
  onStatusChange: (procedureId: string, newStatus: string) => void;
  onLocationChange: (procedureId: string, newLocation: string) => void;
}

const locationOptions = [
  'IR-1', 'IR-2', 'IR-3', 'CT', 'US', 'PACU', 'Lobby', 'Holding'
];

const statusOptions: CaseStatus[] = [
  'Scheduled', 'Arrived', 'Ready', 'In-Procedure', 'PACU', 'Departed'
];

const TechStatusTable = ({
  procedures,
  loading,
  onStatusChange,
  onLocationChange
}: TechStatusTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-md border-ir-border overflow-hidden">
      <table className="ir-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>MRN</th>
            <th>Procedure</th>
            <th>Appointment</th>
            <th>Status</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {procedures.length > 0 ? (
            procedures.map((procedure) => (
              <tr key={procedure.id}>
                <td>{procedure.patient_name}</td>
                <td>{procedure.mrn}</td>
                <td>
                  {procedure.procedure_name}
                  <span className="text-xs ml-1 text-muted-foreground">
                    ({procedure.laterality})
                  </span>
                </td>
                <td>
                  {new Date(procedure.appointment_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td>
                  <Select
                    value={procedure.status}
                    onValueChange={(value) => onStatusChange(procedure.id, value)}
                  >
                    <SelectTrigger className={`w-[140px] ir-status-${procedure.status.toLowerCase()}`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Select
                    value={procedure.location || 'no-location'}
                    onValueChange={(value) => onLocationChange(procedure.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Set location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-location">No Location</SelectItem>
                      {locationOptions.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-8">
                No procedures found for today
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TechStatusTable;
