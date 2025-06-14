
import { useState } from 'react';
import { Zap, Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SearchFilters from '@/components/search/SearchFilters';
import DataDashboard from '@/components/dashboard/DataDashboard';
import { useBusinessImport } from '@/hooks/useBusinessImport';

interface HeroSectionProps {
  onStartQuiz: () => void;
  onSearch: (query: string, filters: any) => void;
  onClearSearch: () => void;
}

const HeroSection = ({ onStartQuiz, onSearch, onClearSearch }: HeroSectionProps) => {
  const { 
    importBusinesses, 
    isImporting, 
    importError, 
    importSuccess, 
    checkImportStatus 
  } = useBusinessImport();

  const handleImportData = () => {
    importBusinesses();
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center px-4 py-2 bg-[#00C2FF]/20 rounded-full text-[#00C2FF] text-sm font-medium mb-6">
          <Zap className="w-4 h-4 mr-2" />
          Powered by AI Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Alabama's
          <span className="bg-gradient-to-r from-[#00C2FF] to-blue-600 bg-clip-text text-transparent"> AI Ecosystem</span>
          <br />Connected
        </h1>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Discover, connect, and grow with Alabama's thriving artificial intelligence community. 
          From Birmingham to Huntsville, find the AI solutions and talent that drive innovation.
        </p>
        
        {/* Data Import Alert */}
        {checkImportStatus.data?.needsImport && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-600">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-blue-200">
              Ready to import {checkImportStatus.data.totalToImport} businesses from Mobile & Baldwin counties into your directory.
              <Button 
                onClick={handleImportData} 
                disabled={isImporting}
                className="ml-4 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Business Data'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {importSuccess && (
          <Alert className="mb-6 bg-green-900/20 border-green-600">
            <AlertDescription className="text-green-200">
              Business data imported successfully! Your directory now includes companies from Mobile and Baldwin counties.
            </AlertDescription>
          </Alert>
        )}

        {importError && (
          <Alert className="mb-6 bg-red-900/20 border-red-600">
            <AlertDescription className="text-red-200">
              Error importing business data. Please try again.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Quick Start CTA */}
        <div className="mb-8">
          <Button 
            onClick={onStartQuiz}
            size="lg" 
            className="bg-gradient-to-r from-[#00C2FF] to-blue-600 hover:from-[#00A8D8] hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Get AI-Powered Recommendations
          </Button>
          <p className="text-sm text-gray-400 mt-2">Takes 30 seconds • Get personalized matches</p>
        </div>

        {/* Enhanced Search Bar */}
        <SearchFilters onSearch={onSearch} onClear={onClearSearch} />

        {/* Real-time Data Dashboard */}
        <div className="mt-12">
          <DataDashboard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
