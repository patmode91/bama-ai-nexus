
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBusinessImport } from '@/hooks/useBusinessImport';
import { useAlabamaAIImport } from '@/hooks/useAlabamaAIImport';
import { Download, Database, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

const BusinessImportManager = () => {
  const [importProgress, setImportProgress] = useState(0);
  
  const {
    importBusinesses: importMobileCounty,
    isImporting: isImportingMobile,
    importError: mobileError,
    importSuccess: mobileSuccess,
    checkImportStatus: mobileStatus,
    MOBILE_COUNTY_BUSINESSES,
    BALDWIN_COUNTY_BUSINESSES
  } = useBusinessImport();

  const {
    importAlabamaAICompanies,
    isImporting: isImportingAI,
    importError: aiError,
    importSuccess: aiSuccess,
    totalCompanies: totalAICompanies
  } = useAlabamaAIImport();

  const handleImportMobileCounty = async () => {
    try {
      setImportProgress(10);
      toast.info('Starting Mobile/Baldwin County business import...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImportProgress(50);
      
      importMobileCounty();
      
      setImportProgress(100);
      toast.success('Mobile/Baldwin County businesses imported successfully!');
    } catch (error) {
      toast.error('Import failed');
      setImportProgress(0);
    }
  };

  const handleImportAlabamaAI = async () => {
    try {
      setImportProgress(10);
      toast.info('Starting Alabama AI companies import...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImportProgress(50);
      
      importAlabamaAICompanies();
      
      setImportProgress(100);
      toast.success('Alabama AI companies imported successfully!');
    } catch (error) {
      toast.error('AI companies import failed');
      setImportProgress(0);
    }
  };

  const isImporting = isImportingMobile || isImportingAI;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Business Data Import Manager</h2>
      </div>

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Import Progress</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile/Baldwin County Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Mobile & Baldwin County Businesses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{MOBILE_COUNTY_BUSINESSES.length}</div>
              <div className="text-sm text-muted-foreground">Mobile County</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{BALDWIN_COUNTY_BUSINESSES.length}</div>
              <div className="text-sm text-muted-foreground">Baldwin County</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{MOBILE_COUNTY_BUSINESSES.length + BALDWIN_COUNTY_BUSINESSES.length}</div>
              <div className="text-sm text-muted-foreground">Total Businesses</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                Tech Focus
              </Badge>
            </div>
          </div>

          {mobileError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Import failed: {mobileError.message}
              </AlertDescription>
            </Alert>
          )}

          {mobileSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Mobile & Baldwin County businesses imported successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleImportMobileCounty}
            disabled={isImporting}
            className="w-full"
          >
            {isImportingMobile ? 'Importing...' : 'Import Mobile & Baldwin County Businesses'}
          </Button>
        </CardContent>
      </Card>

      {/* Alabama AI Companies Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Alabama AI Companies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalAICompanies}</div>
              <div className="text-sm text-muted-foreground">AI Companies</div>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                Statewide
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                AI Focused
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="default" className="text-xs">
                Curated List
              </Badge>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This includes 29 carefully researched AI companies across Alabama, including major players like Adtran, Torch Technologies, and emerging startups.
            </AlertDescription>
          </Alert>

          {aiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Import failed: {aiError.message}
              </AlertDescription>
            </Alert>
          )}

          {aiSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Alabama AI companies imported successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleImportAlabamaAI}
            disabled={isImporting}
            className="w-full"
          >
            {isImportingAI ? 'Importing...' : 'Import Alabama AI Companies'}
          </Button>
        </CardContent>
      </Card>

      {/* Import Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Mobile/Baldwin County Businesses:</span>
              <Badge variant={mobileSuccess ? "default" : "secondary"}>
                {mobileSuccess ? "Imported" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Alabama AI Companies:</span>
              <Badge variant={aiSuccess ? "default" : "secondary"}>
                {aiSuccess ? "Imported" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between font-medium pt-2 border-t">
              <span>Total Potential Records:</span>
              <span>{MOBILE_COUNTY_BUSINESSES.length + BALDWIN_COUNTY_BUSINESSES.length + totalAICompanies}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessImportManager;
