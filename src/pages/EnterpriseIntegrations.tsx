
import { Helmet } from 'react-helmet-async';
import EnterpriseIntegrationsManager from '@/components/enterprise/EnterpriseIntegrationsManager';

const EnterpriseIntegrations = () => {
  return (
    <>
      <Helmet>
        <title>Enterprise Integrations - BAMA AI Nexus</title>
        <meta name="description" content="Manage your enterprise integrations and business system connections" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <EnterpriseIntegrationsManager />
        </div>
      </div>
    </>
  );
};

export default EnterpriseIntegrations;
