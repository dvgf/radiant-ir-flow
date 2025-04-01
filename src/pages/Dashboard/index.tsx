
import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchTodaysProcedures } from '@/lib/supabase';
import { Procedure, CaseStatus } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadProcedures = async () => {
      try {
        setLoading(true);
        const data = await fetchTodaysProcedures();
        setProcedures(data);
      } catch (error) {
        console.error('Error loading procedures:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, []);

  // Count procedures by status
  const statusCounts = procedures.reduce((acc, procedure) => {
    const status = procedure.status as CaseStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<CaseStatus, number>);

  // Format for chart
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // Calculate total procedures
  const totalProcedures = procedures.length;
  const inProgressCount = 
    (statusCounts['Arrived'] || 0) + 
    (statusCounts['Ready'] || 0) + 
    (statusCounts['In-Procedure'] || 0);
  const completedCount = statusCounts['Departed'] || 0;

  // Filter procedures by status
  const inProgressProcedures = procedures.filter(p => 
    ['Arrived', 'Ready', 'In-Procedure'].includes(p.status)
  );
  
  const upcomingProcedures = procedures.filter(p => p.status === 'Scheduled');

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || user?.email?.split('@')[0]}!
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Total Cases Today
                    </CardTitle>
                    <CardDescription>Across all statuses</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProcedures}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      In Progress
                    </CardTitle>
                    <CardDescription>Arrived, Ready, In-Procedure</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Completed
                    </CardTitle>
                    <CardDescription>Departed</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="status" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '0.375rem',
                            color: '#cbd5e1'
                          }}
                        />
                        <Bar dataKey="count" fill="#3730a3" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Procedures Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="in-progress">
                    <TabsList className="mb-4">
                      <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    </TabsList>
                    <TabsContent value="in-progress">
                      <div className="space-y-8">
                        {inProgressProcedures.length > 0 ? (
                          inProgressProcedures.slice(0, 5).map((procedure) => (
                            <div key={procedure.id} className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{procedure.patient_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {procedure.procedure_name} - {procedure.laterality}
                                </p>
                              </div>
                              <div className={`ir-status-pill ir-status-${procedure.status.toLowerCase()}`}>
                                {procedure.status}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No procedures currently in progress
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="upcoming">
                      <div className="space-y-8">
                        {upcomingProcedures.length > 0 ? (
                          upcomingProcedures.slice(0, 5).map((procedure) => (
                            <div key={procedure.id} className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{procedure.patient_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {procedure.procedure_name} - {procedure.laterality}
                                </p>
                              </div>
                              <div className="text-xs">
                                {new Date(procedure.appointment_time).toLocaleTimeString([], { 
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No upcoming procedures scheduled
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
