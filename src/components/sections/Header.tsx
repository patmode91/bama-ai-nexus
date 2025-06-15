
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Search, 
  User, 
  LogOut, 
  Settings,
  BarChart3,
  Brain,
  Users,
  Zap
} from 'lucide-react';
import RealtimeStatusIndicator from '@/components/realtime/RealtimeStatusIndicator';
import LiveUserCounter from '@/components/realtime/LiveUserCounter';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Alabama Business Directory</span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-2">
              <RealtimeStatusIndicator />
              <LiveUserCounter />
            </div>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/directory">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Directory
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Search</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                    <Link to="/advanced-search" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <Search className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Advanced Search</div>
                        <div className="text-sm text-gray-600">Enhanced search with filters</div>
                      </div>
                    </Link>
                    <Link to="/ai-search" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <Brain className="w-4 h-4" />
                      <div>
                        <div className="font-medium">AI Search</div>
                        <div className="text-sm text-gray-600">Intelligent business matching</div>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/events">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Events
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/forum">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Community
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Real-time</span>
                    <Badge variant="secondary" className="ml-1">New</Badge>
                  </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                    <Link to="/realtime" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <Zap className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Real-time Features</div>
                        <div className="text-sm text-gray-600">Live chat, notifications, and more</div>
                      </div>
                    </Link>
                    <Link to="/collaboration" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <Users className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Collaboration Hub</div>
                        <div className="text-sm text-gray-600">Work together in real-time</div>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {user && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <User className="w-4 h-4 mr-1" />
                    Account
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px]">
                      <Link to="/profile" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link to="/analytics" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          {!user ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/add-business">
                <Button>Add Business</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/add-business">
                <Button>Add Business</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <RealtimeStatusIndicator />
                  <LiveUserCounter />
                </div>
                
                <Link to="/directory" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Directory
                  </Button>
                </Link>
                
                <Link to="/advanced-search" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Advanced Search
                  </Button>
                </Link>
                
                <Link to="/events" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                  </Button>
                </Link>
                
                <Link to="/forum" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Community
                  </Button>
                </Link>
                
                <Link to="/realtime" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Zap className="mr-2 h-4 w-4" />
                    Real-time Features
                  </Button>
                </Link>
                
                <Link to="/collaboration" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Collaboration
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
                
                <Link to="/add-business" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Add Business</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
