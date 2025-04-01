
import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  fetchTodaysProcedures, 
  updateProcedureStatus, 
  updateProcedureLocation 
} from '@/lib/supabase';
import { Procedure, CaseStatus } from '@/types';
import { 
  RefreshCw, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const locationOptions = [
  'IR-1', 'IR-2', 'IR-3', 'CT', 'US', 'PACU', 'Lobby', 'Holding'
];

const statusOptions: CaseStatus[] = [
  'Scheduled', 'Arrived', 'Ready', 'In-Procedure', 'PACU', 'Departed'
];

const TechStatus = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProcedures();
    
    // Set up real-time subscription
    const proceduresSubscription = supabase
      .channel('procedures-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'procedures',
        },
        (payload) => {
          // Update the procedures list when a change is detected
          setProcedures(currentProcedures => {
            return currentProcedures.map(procedure => {
              if (procedure.id === payload.new.id) {
                return { ...procedure, ...payload.new };
              }
              return procedure;
            });
          });
        }
      )
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(proceduresSubscription);
    };
  }, []);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      const data = await fetchTodaysProcedures();
      setProcedures(data);
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
      await loadProcedures();
      toast({
        title: 'Refreshed',
        description: 'Procedure list has been refreshed.',
      });
    } catch (error) {
      console.error('Error refreshing procedures:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (procedureId: string, newStatus: string) => {
    try {
      await updateProcedureStatus(procedureId, newStatus);
      
      setProcedures(currentProcedures => {
        return currentProcedures.map(procedure => {
          if (procedure.id === procedureId) {
            return { ...procedure, status: newStatus as CaseStatus };
          }
          return procedure;
        });
      });
      
      toast({
        title: 'Status Updated',
        description: `Case status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update case status.',
        variant: 'destructive',
      });
    }
  };

  const handleLocationChange = async (procedureId: string, newLocation: string) => {
    try {
      await updateProcedureLocation(procedureId, newLocation);
      
      setProcedures(currentProcedures => {
        return currentProcedures.map(procedure => {
          if (procedure.id === procedureId) {
            return { ...procedure, location: newLocation };
          }
          return procedure;
        });
      });
      
      toast({
        title: 'Location Updated',
        description: `Case location has been updated to ${newLocation}.`,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update case location.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Tech Status Board</h1>
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
          </div>
        ) : (
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
                          onValueChange={(value) => handleStatusChange(procedure.id, value)}
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
                          value={procedure.location || 'none'}
                          onValueChange={(value) => handleLocationChange(procedure.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Set location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Location</SelectItem>
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
        )}
      </div>
    </AppLayout>
  );
};

export default TechStatus;
