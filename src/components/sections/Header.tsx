import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Search, Calendar, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LiveNotificationCenter from '@/components/realtime/LiveNotificationCenter';
import ConnectionStatus from '@/components/realtime/ConnectionStatus';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">BamaConnect</h1>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/community" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </Link>
            <Link to="/ai-search" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              AI Search
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </Link>
            <Link to="/forums" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forums
            </Link>
            <Link to="/analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link to="/realtime" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Hub
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <LiveNotificationCenter />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                {user.email === 'admin@bamaconnect.com' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
