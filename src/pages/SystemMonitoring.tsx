
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import AdvancedPerformanceDashboard from '@/components/admin/AdvancedPerformanceDashboard';

const SystemMonitoring = () => {
  return (
    <>
      <Helmet>
        <title>System Monitoring - BAMA AI Nexus</title>
        <meta name="description" content="Advanced system monitoring and performance optimization dashboard" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <AdvancedPerformanceDashboard />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default SystemMonitoring;
