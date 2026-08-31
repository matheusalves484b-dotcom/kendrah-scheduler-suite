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
import ProfilePage from "./pages/Dashboard/ProfilePage";
import SubscriptionPage from "./pages/Dashboard/SubscriptionPage";
import PublicBookingPage from "./pages/Dashboard/PublicBookingPage";
import BookingPage from "./pages/BookingPage";
import BookingSlugPage from "./pages/BookingSlugPage";
import BookingConfirmedPage from "./pages/BookingConfirmedPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PwaInstallGuide from "./components/PwaInstallGuide";
import Footer from "./components/Footer";

import FeaturesPage from "./pages/InstitutionalPages/FeaturesPage";
import PricingPage from "./pages/InstitutionalPages/PricingPage";
import ContactPage from "./pages/InstitutionalPages/ContactPage";
import FAQPage from "./pages/InstitutionalPages/FAQPage";
import TermsPage from "./pages/InstitutionalPages/TermsPage";
import PrivacyPage from "./pages/InstitutionalPages/PrivacyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<div className="flex flex-col min-h-screen"><LoginPage /><Footer /></div>} />
            <Route path="/register" element={<div className="flex flex-col min-h-screen"><RegisterPage /><Footer /></div>} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/agendar/:slug" element={<BookingSlugPage />} />
            <Route path="/agendamento-confirmado" element={<BookingConfirmedPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/dashboard/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
            <Route path="/dashboard/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
            <Route path="/dashboard/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
            <Route path="/dashboard/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/public" element={<ProtectedRoute><PublicBookingPage /></ProtectedRoute>} />
            <Route path="*" element={<div className="flex flex-col min-h-screen"><NotFound /><Footer /></div>} />
          </Routes>
          <PwaInstallGuide />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
