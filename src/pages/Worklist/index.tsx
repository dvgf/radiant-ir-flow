
import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  fetchProcedures, 
  updateTechNotes, 
  triggerKeragonWebhook 
} from '@/lib/supabase';
import { Procedure } from '@/types';
import { 
  RefreshCw, 
  Loader2
} from 'lucide-react';
import { debounce } from 'lodash';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WorklistFilters from './components/WorklistFilters';
import ProcedureList from './components/ProcedureList';

const Worklist = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [techNotes, setTechNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for unique values for filters
  const [uniqueProcedureTypes, setUniqueProcedureTypes] = useState<string[]>([]);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  // Current filter values
  const [currentFilters, setCurrentFilters] = useState({
    showTodayOnly: true,
    startDate: new Date(),
    endDate: new Date(),
    procedureType: '',
    status: '',
    reportStatus: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadProcedures();
  }, [
    currentFilters.showTodayOnly, 
    currentFilters.startDate, 
    currentFilters.endDate, 
    currentFilters.procedureType, 
    currentFilters.status
  ]);

  useEffect(() => {
    if (procedures.length > 0) {
      const procedureTypes = [...new Set(procedures.map(p => p.procedure_name))];
      setUniqueProcedureTypes(procedureTypes);

      const statuses = [...new Set(procedures.map(p => p.status))];
      setUniqueStatuses(statuses);
    }
  }, [procedures]);

  useEffect(() => {
    let filtered = [...procedures];

    if (currentFilters.searchTerm.trim() !== '') {
      const lowercasedSearch = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (procedure) =>
          procedure.patient_name.toLowerCase().includes(lowercasedSearch) ||
          procedure.mrn.toLowerCase().includes(lowercasedSearch) ||
          procedure.procedure_name.toLowerCase().includes(lowercasedSearch)
      );
    }

    if (currentFilters.reportStatus) {
      filtered = filtered.filter(
        (procedure) => getReportStatus(procedure.id) === currentFilters.reportStatus
      );
    }

    setFilteredProcedures(filtered);
  }, [currentFilters.searchTerm, procedures, currentFilters.reportStatus]);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      
      const filters: {
        startDate?: string;
        endDate?: string;
        procedureType?: string;
        status?: string;
      } = {};
      
      if (currentFilters.showTodayOnly) {
        const today = new Date().toISOString().split('T')[0];
        filters.startDate = today;
        filters.endDate = today;
      } else {
        if (currentFilters.startDate) {
          filters.startDate = currentFilters.startDate.toISOString().split('T')[0];
        }
        if (currentFilters.endDate) {
          filters.endDate = currentFilters.endDate.toISOString().split('T')[0];
        }
      }
      
      if (currentFilters.procedureType) {
        filters.procedureType = currentFilters.procedureType;
      }
      
      if (currentFilters.status) {
        filters.status = currentFilters.status;
      }
      
      const data = await fetchProcedures(filters);
      setProcedures(data);

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
      
      const webhookUrl = procedures[0]?.webhook_url;
      if (webhookUrl) {
        await triggerKeragonWebhook(webhookUrl);
        toast({
          title: 'Schedule Refreshed',
          description: 'Schedule has been refreshed from Keragon.',
        });
      }
      
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

  const handleTechNotesChange = (id: string, value: string) => {
    setTechNotes(prev => ({ ...prev, [id]: value }));
    
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

  const getReportStatus = (procedureId: string) => {
    const statuses = {
      [procedureId]: 'Not Started',
    };
    
    return statuses[procedureId] || 'Not Started';
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Procedure Worklist</h1>
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

        <WorklistFilters
          onFilterChange={handleFilterChange}
          uniqueProcedureTypes={uniqueProcedureTypes}
          uniqueStatuses={uniqueStatuses}
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
          </div>
        ) : (
          <ProcedureList
            procedures={filteredProcedures}
            onTechNotesChange={handleTechNotesChange}
            techNotes={techNotes}
            navigateToReport={navigateToReport}
            userRole={user?.role}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Worklist;
