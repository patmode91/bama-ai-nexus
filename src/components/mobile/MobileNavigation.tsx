
import { useState } from 'react';
import { Search, Building2, Users, Menu, Home, Phone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MobileNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => navigate('/') },
    { id: 'directory', label: 'Directory', icon: Building2, action: () => navigate('/#directory') },
    { id: 'about', label: 'About', icon: Info, action: () => navigate('/about') },
    { id: 'contact', label: 'Contact', icon: Phone, action: () => navigate('/contact') },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    item.action();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick(item)}
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
