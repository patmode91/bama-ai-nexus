
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Analytics from "./pages/Analytics";
import BusinessProfile from "./pages/BusinessProfile";
import BusinessDashboard from "./pages/BusinessDashboard";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Forums from "./pages/Forums";
import Community from "./pages/Community";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import AISearch from "./pages/AISearch";
import ComparisonPage from "./pages/ComparisonPage";
import Integrations from "./pages/Integrations";
import MobileSettings from "./pages/MobileSettings";
import Realtime from "./pages/Realtime";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/business/:id" element={<BusinessProfile />} />
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/community" element={<Community />} />
            <Route path="/events" element={<Events />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/ai-search" element={<AISearch />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/mobile-settings" element={<MobileSettings />} />
            <Route path="/realtime" element={<Realtime />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
