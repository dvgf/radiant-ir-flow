
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // While checking authentication status, show a loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ir-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading</h2>
          <div className="flex justify-center space-x-2">
            <div className="h-3 w-3 bg-ir-primary rounded-full animate-bounce"></div>
            <div className="h-3 w-3 bg-ir-primary rounded-full animate-bounce delay-100"></div>
            <div className="h-3 w-3 bg-ir-primary rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-ir-background overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} userRole={user.role} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
