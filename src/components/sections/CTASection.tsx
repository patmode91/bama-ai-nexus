
import { Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SocialShareButtons from '../social/SocialShareButtons';

const CTASection = () => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = "Discover Alabama's AI Ecosystem on BamaAI Connect!";

  return (
    <section className="py-16 px-6 bg-gradient-to-r from-gray-800 to-gray-700">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Alabama's AI Revolution?</h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Whether you're building AI solutions or looking to implement them, 
          BamaAI Connect helps you find the right connections.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#00C2FF] hover:bg-[#00A8D8]">
            List Your Company
            <Building2 className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-slate-900">
            Find AI Solutions
            <Search className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="mt-8">
          <p className="text-slate-300 mb-4">Share BamaAI Connect</p>
          <SocialShareButtons url={shareUrl} title={shareTitle} />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
