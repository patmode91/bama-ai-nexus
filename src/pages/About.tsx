
import { Target, Users, Globe, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header onSignIn={() => {}} />
      
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About BamaAI Connect
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Connecting Alabama's AI ecosystem through innovation, collaboration, and growth. 
            We're building the bridge between AI companies, professionals, and opportunities 
            in Mobile and Baldwin counties.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                BamaAI Connect serves as Alabama's premier AI business directory and networking platform. 
                We're dedicated to fostering innovation, facilitating connections, and driving the growth 
                of artificial intelligence initiatives across the Heart of Dixie.
              </p>
              <p className="text-gray-300 leading-relaxed">
                From startups to established enterprises, we provide a comprehensive platform where 
                AI companies can showcase their expertise, connect with potential partners, and 
                contribute to Alabama's emerging technology landscape.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-[#00C2FF] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
                  <p className="text-sm text-gray-300">Driving AI advancement in Alabama</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-[#00C2FF] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                  <p className="text-sm text-gray-300">Building lasting partnerships</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-6 text-center">
                  <Globe className="w-8 h-8 text-[#00C2FF] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Growth</h3>
                  <p className="text-sm text-gray-300">Expanding AI opportunities</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-[#00C2FF] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Impact</h3>
                  <p className="text-sm text-gray-300">Creating meaningful change</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center leading-relaxed">
                  We believe in open, honest communication and provide clear, accurate information 
                  about every business in our directory.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center leading-relaxed">
                  We maintain high standards for our platform and support only quality AI companies 
                  that demonstrate real value and innovation.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center leading-relaxed">
                  We foster an environment where AI companies can work together, share knowledge, 
                  and collectively advance Alabama's tech ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join Alabama's AI Revolution</h2>
          <p className="text-xl text-gray-300 mb-8">
            Whether you're an AI company looking to grow or a business seeking AI solutions, 
            BamaAI Connect is your gateway to Alabama's thriving artificial intelligence community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              List Your Business
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Explore Directory
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
