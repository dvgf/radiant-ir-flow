
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Auth/Login";
import Callback from "./pages/Auth/Callback";
import Dashboard from "./pages/Dashboard";
import Worklist from "./pages/Worklist";
import ReportEditor from "./pages/Reports/ReportEditor";
import TechStatus from "./pages/TechStatus";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<Callback />} />
            
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Worklist */}
            <Route path="/worklist" element={<Worklist />} />
            
            {/* Reports */}
            <Route path="/reports/:procedureId" element={<ReportEditor />} />
            
            {/* Tech Status */}
            <Route path="/tech-status" element={<TechStatus />} />
            
            {/* Admin Routes */}
            <Route path="/templates" element={<Templates />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
