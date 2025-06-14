
import { useState } from 'react';
import { Search, Building2, Users, Menu, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '#' },
    { id: 'directory', label: 'Directory', icon: Building2, href: '#directory' },
    { id: 'search', label: 'Search', icon: Search, href: '#search' },
    { id: 'about', label: 'About', icon: Users, href: '#about' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              activeTab === item.id
                ? 'text-[#00C2FF] bg-[#00C2FF]/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
