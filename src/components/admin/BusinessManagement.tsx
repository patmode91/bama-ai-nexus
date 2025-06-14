
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  CheckCircle, 
  XCircle,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BusinessManagement = () => {
  const { data: businesses, refetch } = useBusinesses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const { toast } = useToast();

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = business.businessname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'verified' && business.verified) ||
                         (filter === 'unverified' && !business.verified);
    
    return matchesSearch && matchesFilter;
  });

  const toggleVerification = async (businessId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ verified: !currentStatus })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Verification Updated",
        description: `Business ${!currentStatus ? 'verified' : 'unverified'} successfully`,
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const deleteBusiness = async (businessId: number) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Business Deleted",
        description: "Business has been permanently removed",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting business:', error);
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search businesses..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
              >
                All ({businesses?.length || 0})
              </Button>
              <Button
                variant={filter === 'verified' ? 'default' : 'outline'}
                onClick={() => setFilter('verified')}
                className={filter === 'verified' ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
              >
                Verified ({businesses?.filter(b => b.verified).length || 0})
              </Button>
              <Button
                variant={filter === 'unverified' ? 'default' : 'outline'}
                onClick={() => setFilter('unverified')}
                className={filter === 'unverified' ? 'bg-yellow-600' : 'border-gray-600 text-gray-300'}
              >
                Unverified ({businesses?.filter(b => !b.verified).length || 0})
              </Button>
            </div>
          </div>

          {/* Business List */}
          <div className="space-y-4">
            {filteredBusinesses?.map((business) => (
              <Card key={business.id} className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {business.businessname}
                        </h3>
                        <Badge 
                          variant={business.verified ? 'default' : 'secondary'}
                          className={business.verified ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {business.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        {business.category && (
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            {business.category}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {business.description || 'No description available'}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        {business.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {business.location}
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <a 
                              href={business.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-[#00C2FF] transition-colors"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {business.contactemail && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {business.contactemail}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVerification(business.id, business.verified || false)}
                        className={
                          business.verified 
                            ? "border-red-600 text-red-400 hover:bg-red-600/10" 
                            : "border-green-600 text-green-400 hover:bg-green-600/10"
                        }
                      >
                        {business.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBusiness(business.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBusinesses?.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No businesses found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessManagement;
