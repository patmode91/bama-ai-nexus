
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import IntelligenceHubDashboard from '@/components/ai/IntelligenceHubDashboard';

const IntelligenceHub = () => {
  return (
    <>
      <Helmet>
        <title>AI Intelligence Hub - BAMA AI Nexus</title>
        <meta name="description" content="Advanced AI intelligence center with predictive analytics, automated insights, and intelligent automation" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <IntelligenceHubDashboard />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default IntelligenceHub;
