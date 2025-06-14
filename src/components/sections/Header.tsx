
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSignIn: () => void;
}

const Header = ({ onSignIn }: HeaderProps) => {
  return (
    <header className="border-b border-gray-600 bg-gray-700/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BamaAI Connect</h1>
              <p className="text-xs text-gray-300">Alabama's AI Ecosystem Hub</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#directory" className="text-gray-300 hover:text-[#00C2FF] transition-colors">Directory</a>
            <a href="#insights" className="text-gray-300 hover:text-[#00C2FF] transition-colors">Insights</a>
            <a href="#jobs" className="text-gray-300 hover:text-[#00C2FF] transition-colors">Jobs</a>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={onSignIn}
            >
              Sign In
            </Button>
            <Button size="sm" className="bg-[#00C2FF] hover:bg-[#00A8D8]">Join Directory</Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
