
import { useState, useEffect } from 'react';
import { Zap, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    }
  };

  return (
    <header className="border-b border-gray-600 bg-gray-700/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BamaAI Connect</h1>
              <p className="text-xs text-gray-300">Alabama's AI Ecosystem Hub</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="/#directory" 
              className="text-gray-300 hover:text-[#00C2FF] transition-colors"
            >
              Directory
            </a>
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-300 hover:text-[#00C2FF] transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="text-gray-300 hover:text-[#00C2FF] transition-colors"
            >
              Contact
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                  onClick={() => navigate('/auth')}
                >
                  Join Directory
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
