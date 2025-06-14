
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBusinesses } from '@/hooks/useBusinesses';
import { toast } from 'sonner';

interface LocationBasedSearchProps {
  onBusinessesFound: (businesses: any[]) => void;
}

const LocationBasedSearch = ({ onBusinessesFound }: LocationBasedSearchProps) => {
  const [searching, setSearching] = useState(false);
  const { latitude, longitude, error, loading, getCurrentPosition, calculateDistance } = useGeolocation();
  const { data: businesses } = useBusinesses();

  const handleLocationSearch = async () => {
    setSearching(true);
    
    if (!latitude || !longitude) {
      getCurrentPosition();
      return;
    }

    try {
      // Filter businesses by location (within 50 miles)
      const nearbyBusinesses = businesses?.filter(business => {
        // For demo purposes, using random coordinates around Alabama cities
        const businessLat = 32.361538 + (Math.random() - 0.5) * 2; // Birmingham area
        const businessLon = -86.279118 + (Math.random() - 0.5) * 2;
        
        const distance = calculateDistance(latitude, longitude, businessLat, businessLon);
        return distance <= 50; // Within 50 miles
      }) || [];

      // Sort by distance (simulated)
      nearbyBusinesses.sort(() => Math.random() - 0.5);

      onBusinessesFound(nearbyBusinesses);
      toast.success(`Found ${nearbyBusinesses.length} businesses near you`);
    } catch (error) {
      console.error('Location search error:', error);
      toast.error('Failed to search by location');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <MapPin className="w-5 h-5 mr-2 text-[#00C2FF]" />
          Find Nearby Businesses
        </CardTitle>
        <CardDescription>
          Discover AI businesses in your area using your location
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
        
        <Button
          onClick={handleLocationSearch}
          disabled={loading || searching}
          className="w-full bg-[#00C2FF] hover:bg-[#0099CC] text-white"
        >
          {(loading || searching) ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Getting Location...' : searching ? 'Searching...' : 'Search Nearby'}
        </Button>
        
        {latitude && longitude && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationBasedSearch;
