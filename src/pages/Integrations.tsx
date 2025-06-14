
import { AuthGuard } from '@/components/auth/AuthGuard';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import IntegrationsManager from '@/components/integrations/IntegrationsManager';
import SEO from '@/components/seo/SEO';

const Integrations = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <SEO 
        title="Integrations"
        description="Connect your business with external tools and services. Set up webhooks, API access, and popular integrations like Zapier and Slack."
      />
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <AuthGuard>
          <IntegrationsManager />
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
};

export default Integrations;
