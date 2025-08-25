import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/Dashboard";
import PartnerDashboard from "./pages/partner/Dashboard";
import ClientDashboard from "./pages/client/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { TenantProvider } from "./components/TenantProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TenantProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="super_admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Partner Routes */}
            <Route path="/partner/dashboard" element={
              <ProtectedRoute requiredRole="partner_admin">
                <PartnerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Client Routes */}
            <Route path="/client/dashboard" element={
              <ProtectedRoute requiredRole="client_user">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TenantProvider>
  </QueryClientProvider>
);

export default App;
