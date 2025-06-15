
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const EventCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 border-gray-700 rounded-lg p-6 space-y-4">
    <Skeleton className="h-4 w-3/4 bg-gray-700" />
    <Skeleton className="h-3 w-full bg-gray-700" />
    <Skeleton className="h-3 w-2/3 bg-gray-700" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-1/4 bg-gray-700" />
      <Skeleton className="h-8 w-20 bg-gray-700" />
    </div>
  </div>
);

export const BusinessCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 border-gray-700 rounded-lg p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-gray-700" />
        <Skeleton className="h-3 w-24 bg-gray-700" />
      </div>
    </div>
    <Skeleton className="h-3 w-full bg-gray-700" />
    <Skeleton className="h-3 w-3/4 bg-gray-700" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-20 bg-gray-700" />
      <Skeleton className="h-8 w-16 bg-gray-700" />
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
    <div className="container mx-auto px-6 py-16 space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto bg-gray-700" />
        <Skeleton className="h-4 w-96 mx-auto bg-gray-700" />
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
