
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EditBusiness = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    businessname: '',
    description: '',
    category: '',
    contactname: '',
    contactemail: '',
    website: '',
    location: '',
  });

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', parseInt(id!))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (business) {
      setFormData({
        businessname: business.businessname || '',
        description: business.description || '',
        category: business.category || '',
        contactname: business.contactname || '',
        contactemail: business.contactemail || '',
        website: business.website || '',
        location: business.location || '',
      });
    }
  }, [business]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('businesses')
        .update(data)
        .eq('id', parseInt(id!))
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (business) => {
      toast({
        title: "Business Updated",
        description: "Your business has been successfully updated.",
      });
      navigate(`/business/${business.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Business</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <Input
                  name="businessname"
                  value={formData.businessname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <Input
                  name="contactname"
                  value={formData.contactname}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input
                  type="email"
                  name="contactemail"
                  value={formData.contactemail}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={updateBusinessMutation.isPending}
              >
                {updateBusinessMutation.isPending ? 'Updating...' : 'Update Business'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditBusiness;
