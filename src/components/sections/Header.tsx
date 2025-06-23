
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link to="/" className="text-xl font-semibold text-white">
            BAMA AI Nexus
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/directory" className="text-gray-300 hover:text-white transition-colors">
              Directory
            </Link>
            <Link to="/ai-agents" className="text-gray-300 hover:text-white transition-colors">
              AI Agents
            </Link>
            <Link to="/partnerships" className="text-gray-300 hover:text-white transition-colors">
              Partnerships
            </Link>
            <Link to="/events" className="text-gray-300 hover:text-white transition-colors">
              Events
            </Link>
            <Link to="/forum" className="text-gray-300 hover:text-white transition-colors">
              Forum
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/business-profile">Business Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/auth" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="md:hidden">
              <Menu className="w-6 h-6 text-white cursor-pointer" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 text-white">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Explore the BAMA AI Nexus
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Link to="/" className="text-gray-300 hover:text-white transition-colors block py-2">
                  Home
                </Link>
                <Link to="/directory" className="text-gray-300 hover:text-white transition-colors block py-2">
                  Directory
                </Link>
                 <Link to="/ai-agents" className="text-gray-300 hover:text-white transition-colors">
                  AI Agents
                </Link>
                <Link to="/partnerships" className="text-gray-300 hover:text-white transition-colors">
                  Partnerships
                </Link>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors block py-2">
                  Events
                </Link>
                <Link to="/forum" className="text-gray-300 hover:text-white transition-colors block py-2">
                  Forum
                </Link>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors block py-2">
                  About
                </Link>
                {!user ? (
                  <>
                    <Link to="/auth" className="text-gray-300 hover:text-white transition-colors block py-2">
                      Login
                    </Link>
                    <Link to="/auth" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors block">
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="text-gray-300 hover:text-white transition-colors block py-2">
                      Profile
                    </Link>
                    <Button variant="destructive" size="sm" className="w-full" onClick={() => signOut()}>
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
