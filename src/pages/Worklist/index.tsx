import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  fetchTodaysProcedures, 
  updateTechNotes, 
  triggerKeragonWebhook 
} from '@/lib/supabase';
import { Procedure, ReportStatus } from '@/types';
import { 
  RefreshCw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Loader2
} from 'lucide-react';
import { debounce } from 'lodash';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Worklist = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [techNotes, setTechNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load procedures
  useEffect(() => {
    loadProcedures();
  }, []);

  // Filter procedures when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProcedures(procedures);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = procedures.filter(
        (procedure) =>
          procedure.patient_name.toLowerCase().includes(lowercasedSearch) ||
          procedure.mrn.toLowerCase().includes(lowercasedSearch) ||
          procedure.procedure_name.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredProcedures(filtered);
    }
  }, [searchTerm, procedures]);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      const data = await fetchTodaysProcedures();
      setProcedures(data);

      // Initialize tech notes from procedure data
      const notesMap: Record<string, string> = {};
      data.forEach(procedure => {
        notesMap[procedure.id] = procedure.tech_notes || '';
      });
      setTechNotes(notesMap);
    } catch (error) {
      console.error('Error loading procedures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load procedures.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // First try to refresh via Keragon webhook if available
      const webhookUrl = procedures[0]?.webhook_url;
      if (webhookUrl) {
        await triggerKeragonWebhook(webhookUrl);
        toast({
          title: 'Schedule Refreshed',
          description: 'Schedule has been refreshed from Keragon.',
        });
      }
      
      // Refresh from database
      await loadProcedures();
    } catch (error) {
      console.error('Error refreshing procedures:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh the schedule.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpandRow = (id: string) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const handleTechNotesChange = (id: string, value: string) => {
    setTechNotes(prev => ({ ...prev, [id]: value }));
    
    // Debounced save to Supabase
    debouncedUpdateNotes(id, value);
  };

  const debouncedUpdateNotes = debounce(async (id: string, value: string) => {
    try {
      await updateTechNotes(id, value);
    } catch (error) {
      console.error('Error updating tech notes:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save technologist notes.',
        variant: 'destructive',
      });
    }
  }, 1000);

  const navigateToReport = (procedureId: string) => {
    navigate(`/reports/${procedureId}`);
  };

  // Determine report status based on procedure ID
  // In a real app, this would fetch status from Supabase
  const getReportStatus = (procedureId: string): ReportStatus => {
    // Mock implementation - would be replaced with actual data
    const statuses: Record<string, ReportStatus> = {
      // For demo purposes only
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
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Today's Worklist</h1>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <div className="flex items-center mb-4">
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
          </div>
        ) : (
          <div className="border rounded-md border-ir-border overflow-hidden">
            <table className="ir-table">
              <thead>
                <tr>
                  <th className="w-8"></th>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Procedure</th>
                  <th>Laterality</th>
                  <th>Status</th>
                  <th>Report Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcedures.length > 0 ? (
                  filteredProcedures.map((procedure) => {
                    const isExpanded = expandedRows.includes(procedure.id);
                    const reportStatus = getReportStatus(procedure.id);
                    
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
                          <td>{procedure.procedure_name}</td>
                          <td>{procedure.laterality}</td>
                          <td>
                            <span className={`ir-status-pill ir-status-${procedure.status.toLowerCase()}`}>
                              {procedure.status}
                            </span>
                          </td>
                          <td>{renderReportStatusPill(reportStatus)}</td>
                          <td className="text-right">
                            {user?.role === 'doctor' && (
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
                            <td colSpan={8} className="bg-ir-muted/30 p-0">
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
                                    onChange={(e) => handleTechNotesChange(procedure.id, e.target.value)}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      No procedures found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Worklist;
