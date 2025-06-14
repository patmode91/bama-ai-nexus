
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, Search, Calendar, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Directory', href: '/', icon: Users },
    { label: 'AI Search', href: '/ai-search', icon: Sparkles },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Forums', href: '/forums', icon: MessageSquare },
    { label: 'Blog', href: '/blog', icon: Search },
  ];

  return (
    <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00C2FF] to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white">BamaAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:text-white">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-800 border-gray-700">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <Button variant="outline" asChild className="w-full border-gray-600">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
