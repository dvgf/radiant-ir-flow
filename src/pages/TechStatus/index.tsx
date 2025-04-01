
import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  fetchTodaysProcedures, 
  updateProcedureStatus, 
  updateProcedureLocation 
} from '@/lib/supabase';
import { Procedure } from '@/types';
import { 
  RefreshCw, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import TechStatusTable from './components/TechStatusTable';

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
            return { ...procedure, status: newStatus as Procedure['status'] };
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

        <TechStatusTable 
          procedures={procedures}
          loading={loading}
          onStatusChange={handleStatusChange}
          onLocationChange={handleLocationChange}
        />
      </div>
    </AppLayout>
  );
};

export default TechStatus;
