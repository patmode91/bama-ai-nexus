
import React from 'react';
import Header from '@/components/sections/Header';
import { OracleDashboard } from '@/components/intelligence/OracleDashboard';

const Oracle: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <OracleDashboard />
    </div>
  );
};

export default Oracle;
