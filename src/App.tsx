import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import BusinessProfile from "./pages/BusinessProfile";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Analytics from "./pages/Analytics";
import BusinessDashboard from "./pages/BusinessDashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ComparisonPage from "./pages/ComparisonPage";
import Integrations from "./pages/Integrations";
import MobileSettings from "./pages/MobileSettings";
import Blog from "./pages/Blog";
import Events from "./pages/Events";
import Forums from "./pages/Forums";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HelmetProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/events" element={<Events />} />
              <Route path="/forums" element={<Forums />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/business/:id" element={<BusinessProfile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/dashboard" element={<BusinessDashboard />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/mobile-settings" element={<MobileSettings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
