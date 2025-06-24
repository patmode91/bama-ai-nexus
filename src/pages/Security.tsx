
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import SecurityDashboard from '@/components/security/SecurityDashboard';

const Security: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Security & Compliance - BAMA AI Nexus</title>
        <meta name="description" content="Monitor security posture and compliance status with comprehensive security dashboard" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <Header />
        <SecurityDashboard />
        <Footer />
      </div>
    </>
  );
};

export default Security;
