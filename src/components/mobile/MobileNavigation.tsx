
import { useState } from 'react';
import { Home, Search, Building2, User, Menu, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
        <div className="grid grid-cols-4 h-16">
          <button className="flex flex-col items-center justify-center text-[#00C2FF]">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center text-gray-400">
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <button className="flex flex-col items-center justify-center text-gray-400">
            <Building2 className="w-5 h-5" />
            <span className="text-xs mt-1">Directory</span>
          </button>
          <button 
            onClick={toggleMenu}
            className="flex flex-col items-center justify-center text-gray-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 h-full w-64 bg-gray-800 shadow-lg">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">BamaAI</span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleMenu}>
                  <X className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-4">
                <a href="#directory" className="block text-gray-300 hover:text-[#00C2FF] transition-colors py-2">
                  Company Directory
                </a>
                <a href="#insights" className="block text-gray-300 hover:text-[#00C2FF] transition-colors py-2">
                  Market Insights
                </a>
                <a href="#jobs" className="block text-gray-300 hover:text-[#00C2FF] transition-colors py-2">
                  AI Jobs
                </a>
                <a href="#events" className="block text-gray-300 hover:text-[#00C2FF] transition-colors py-2">
                  Events & Networking
                </a>
                <hr className="border-gray-700" />
                <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  Sign In
                </Button>
                <Button size="sm" className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]">
                  Join Directory
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for bottom navigation */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default MobileNavigation;
