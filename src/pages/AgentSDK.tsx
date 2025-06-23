
import React from 'react';
import Header from '@/components/sections/Header';
import { SDKDashboard } from '@/components/intelligence/SDKDashboard';

const AgentSDK: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <SDKDashboard />
    </div>
  );
};

export default AgentSDK;
