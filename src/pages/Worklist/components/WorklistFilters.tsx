
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ReportStatus } from '@/types';

interface WorklistFiltersProps {
  onFilterChange: (filters: {
    showTodayOnly: boolean;
    startDate?: Date;
    endDate?: Date;
    procedureType: string;
    status: string;
    reportStatus: string;
    searchTerm: string;
  }) => void;
  uniqueProcedureTypes: string[];
  uniqueStatuses: string[];
}

const WorklistFilters = ({ 
  onFilterChange, 
  uniqueProcedureTypes, 
  uniqueStatuses 
}: WorklistFiltersProps) => {
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [procedureType, setProcedureType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [reportStatus, setReportStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    onFilterChange({
      showTodayOnly,
      startDate,
      endDate,
      procedureType,
      status,
      reportStatus,
      searchTerm
    });
  }, [showTodayOnly, startDate, endDate, procedureType, status, reportStatus, searchTerm, onFilterChange]);

  return (
    <div className="space-y-4">
      <div className="bg-ir-muted/40 rounded-lg p-4 border border-ir-border">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Filter Options</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="today-switch" className="text-sm">Today Only</Label>
              <Switch 
                id="today-switch" 
                checked={showTodayOnly} 
                onCheckedChange={setShowTodayOnly}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {!showTodayOnly && (
              <>
                <div>
                  <Label htmlFor="start-date" className="text-xs mb-2 block">Start Date</Label>
                  <DatePicker
                    id="start-date"
                    date={startDate}
                    setDate={setStartDate}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-xs mb-2 block">End Date</Label>
                  <DatePicker
                    id="end-date"
                    date={endDate}
                    setDate={setEndDate}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="procedure-type" className="text-xs mb-2 block">Procedure Type</Label>
              <Select value={procedureType} onValueChange={setProcedureType}>
                <SelectTrigger id="procedure-type">
                  <SelectValue placeholder="All Procedures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-procedures">All Procedures</SelectItem>
                  {uniqueProcedureTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-xs mb-2 block">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="report-status" className="text-xs mb-2 block">Report Status</Label>
              <Select value={reportStatus} onValueChange={setReportStatus}>
                <SelectTrigger id="report-status">
                  <SelectValue placeholder="All Report Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-report-statuses">All Report Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="Summary Only">Summary Only</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient, MRN, or procedure..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default WorklistFilters;
