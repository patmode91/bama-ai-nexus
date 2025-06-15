
import { Helmet } from 'react-helmet-async';
import EnterpriseDashboard from '@/components/enterprise/EnterpriseDashboard';

const Enterprise = () => {
  return (
    <>
      <Helmet>
        <title>Enterprise Dashboard - BAMA AI Nexus</title>
        <meta name="description" content="Comprehensive enterprise dashboard with analytics and integrations" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <EnterpriseDashboard />
        </div>
      </div>
    </>
  );
};

export default Enterprise;
