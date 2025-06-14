
import { Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-12 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">BamaAI Connect</span>
            </div>
            <p className="text-slate-600 mb-4 max-w-md">
              Connecting Alabama's artificial intelligence ecosystem. 
              Powered by intelligent matchmaking and real-time market insights.
            </p>
            <div className="flex items-center text-sm text-slate-500">
              <Zap className="w-4 h-4 mr-2 text-[#00C2FF]" />
              AI-Powered Platform
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Platform</h3>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Directory</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Job Board</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Market Insights</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">AI Matchmaking</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-slate-500">
          <p>&copy; 2024 BamaAI Connect. Empowering Alabama's AI ecosystem.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
