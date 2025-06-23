
import React from 'react';
import { PartnershipHub } from '@/components/partnerships/PartnershipHub';

const Partnerships: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PartnershipHub />
      </div>
    </div>
  );
};

export default Partnerships;
