
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useSavedBusinesses } from '@/hooks/useSavedBusinesses';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Zap, User, Building2, Heart, ArrowLeft, Save, LogOut } from 'lucide-react';
import Header from '@/components/sections/Header';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading: profileLoading, updateProfile, isUpdating } = useProfile();
  const { savedBusinesses, isLoading: savedLoading } = useSavedBusinesses();
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    role: '',
    industry: '',
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        role: profile.role || '',
        industry: profile.industry || '',
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate('/');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) {
    return null; // Loading or redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header onSignIn={() => {}} />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{profile?.full_name || 'User Profile'}</h1>
            <p className="text-gray-300">{user.email}</p>
          </div>
          <div className="ml-auto">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#00C2FF] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#00C2FF] data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Saved Businesses ({savedBusinesses?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-300">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your company"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-gray-300">Role</Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your role"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your industry"
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdating || profileLoading}
                      className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Saved Businesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Loading saved businesses...</div>
                  </div>
                ) : savedBusinesses && savedBusinesses.length > 0 ? (
                  <div className="grid gap-4">
                    {savedBusinesses.map((business) => (
                      <div
                        key={business.id}
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-[#00C2FF] transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {business.businessname}
                            </h3>
                            <p className="text-gray-300 text-sm mb-2">
                              {business.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              {business.category && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {business.category}
                                </span>
                              )}
                              {business.location && (
                                <span>{business.location}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/business/${business.id}`)}
                            size="sm"
                            className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No saved businesses yet</h3>
                    <p className="text-gray-400 mb-4">
                      Start exploring the directory and save businesses you're interested in.
                    </p>
                    <Button
                      onClick={() => navigate('/')}
                      className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                    >
                      Browse Directory
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Profile;
