
import { Helmet } from 'react-helmet-async';
import EnterpriseAnalyticsDashboard from '@/components/enterprise/EnterpriseAnalyticsDashboard';

const EnterpriseAnalytics = () => {
  return (
    <>
      <Helmet>
        <title>Enterprise Analytics - BAMA AI Nexus</title>
        <meta name="description" content="Comprehensive business intelligence and analytics dashboard for enterprise insights" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <EnterpriseAnalyticsDashboard />
        </div>
      </div>
    </>
  );
};

export default EnterpriseAnalytics;
