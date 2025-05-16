
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import CalendarPage from "./pages/Dashboard/CalendarPage";
import ServicesPage from "./pages/Dashboard/ServicesPage";
import ClientsPage from "./pages/Dashboard/ClientsPage";
import AvailabilityPage from "./pages/Dashboard/AvailabilityPage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import SubscriptionPage from "./pages/Dashboard/SubscriptionPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/calendar" element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/services" element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/clients" element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/availability" element={
            <ProtectedRoute>
              <AvailabilityPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/subscription" element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
