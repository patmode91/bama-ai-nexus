import { useState, useEffect } from 'react';
import { Building2, Menu, X, User, Settings, LogOut, BarChart3, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BamaAI Connect</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Directory
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Analytics
            </button>
            {user && (
              <button 
                onClick={() => navigate('/admin')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Admin
              </button>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Business Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/analytics')}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={handleSignIn}
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignIn}
                  className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-gray-300 hover:text-white transition-colors text-left"
              >
                Directory
              </button>
              <button 
                onClick={() => { navigate('/about'); setIsMenuOpen(false); }}
                className="text-gray-300 hover:text-white transition-colors text-left"
              >
                About
              </button>
              <button 
                onClick={() => { navigate('/contact'); setIsMenuOpen(false); }}
                className="text-gray-300 hover:text-white transition-colors text-left"
              >
                Contact
              </button>
              <button 
                onClick={() => { navigate('/analytics'); setIsMenuOpen(false); }}
                className="text-gray-300 hover:text-white transition-colors text-left"
              >
                Analytics
              </button>
              
              {user ? (
                <>
                  <button 
                    onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Business Dashboard
                  </button>
                  <button 
                    onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Admin
                  </button>
                  <button 
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { handleSignIn(); setIsMenuOpen(false); }}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
