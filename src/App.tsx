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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          {/* Partner Routes */}
          <Route 
            path="/partner/*" 
            element={
              <ProtectedRoute requiredRole="partner_admin">
                <Routes>
                  <Route path="/" element={<PartnerDashboard />} />
                  <Route path="/dashboard" element={<PartnerDashboard />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          {/* Client Routes */}
          <Route 
            path="/client/*" 
            element={
              <ProtectedRoute requiredRole="client_user">
                <Routes>
                  <Route path="/" element={<ClientDashboard />} />
                  <Route path="/dashboard" element={<ClientDashboard />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
