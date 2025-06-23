import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { AppEnhancementProvider } from '@/components/common/AppEnhancementProvider';
import MobileNavigation from '@/components/mobile/MobileNavigation';

// Import all pages
import Index from "./pages/Index";
import Directory from "./pages/Directory";
import BusinessDetail from "./pages/BusinessDetail";
import AddBusiness from "./pages/AddBusiness";
import EditBusiness from "./pages/EditBusiness";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import Forum from "./pages/Forum";
import ForumTopic from "./pages/ForumTopic";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import SystemDashboard from "./pages/SystemDashboard";
import SystemMonitoring from "./pages/SystemMonitoring";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessProfile from "./pages/BusinessProfile";
import AdvancedSearch from "./pages/AdvancedSearch";
import AISearch from "./pages/AISearch";
import Community from "./pages/Community";
import Integrations from "./pages/Integrations";
import ComparisonPage from "./pages/ComparisonPage";
import Blog from "./pages/Blog";
import Realtime from "./pages/Realtime";
import Collaboration from "./pages/Collaboration";
import MobileSettings from "./pages/MobileSettings";
import NotFound from "./pages/NotFound";
import Enterprise from "./pages/Enterprise";
import EnterpriseAnalytics from "./pages/EnterpriseAnalytics";
import EnterpriseIntegrations from "./pages/EnterpriseIntegrations";
import IntelligenceHub from "./pages/IntelligenceHub";
import { AIAgentsPage } from "./pages/AIAgentsPage";
import Partnerships from "./pages/Partnerships";
import Oracle from "./pages/Oracle";
import AgentSDK from "./pages/AgentSDK";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppEnhancementProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/business/:id" element={<BusinessDetail />} />
              <Route path="/add-business" element={<AddBusiness />} />
              <Route path="/edit-business/:id" element={<EditBusiness />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/topic/:id" element={<ForumTopic />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/system" element={<SystemDashboard />} />
              <Route path="/system-monitoring" element={<SystemMonitoring />} />
              <Route path="/business-dashboard" element={<BusinessDashboard />} />
              <Route path="/business-profile" element={<BusinessProfile />} />
              <Route path="/advanced-search" element={<AdvancedSearch />} />
              <Route path="/ai-search" element={<AISearch />} />
              <Route path="/ai-agents" element={<AIAgentsPage />} />
              <Route path="/community" element={<Community />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/realtime" element={<Realtime />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/mobile-settings" element={<MobileSettings />} />
              <Route path="/enterprise" element={<Enterprise />} />
              <Route path="/enterprise-analytics" element={<EnterpriseAnalytics />} />
              <Route path="/enterprise-integrations" element={<EnterpriseIntegrations />} />
              <Route path="/intelligence-hub" element={<IntelligenceHub />} />
              <Route path="/oracle" element={<Oracle />} />
              <Route path="/agent-sdk" element={<AgentSDK />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileNavigation />
          </BrowserRouter>
        </AppEnhancementProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const App: React.FC = () => {
  return (
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  );
};

export default App;
