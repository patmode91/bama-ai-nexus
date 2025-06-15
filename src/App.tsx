
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Analytics from "./pages/Analytics";
import AdvancedSearch from "./pages/AdvancedSearch";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
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
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/search" element={<AdvancedSearch />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
