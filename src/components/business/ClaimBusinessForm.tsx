
import { useState } from 'react';
import { Building2, Mail, Phone, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ClaimBusinessFormProps {
  businessName: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ClaimBusinessForm = ({ businessName, onSubmit, onCancel }: ClaimBusinessFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    companyEmail: '',
    message: '',
    documents: null as File[] | null
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Claim business form submitted:', formData);
    onSubmit(formData);
    setIsSubmitted(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Claim Request Submitted!</h3>
          <p className="text-gray-300 mb-6">
            Thank you for claiming <strong>{businessName}</strong>. We've received your request and will 
            review it within 2-3 business days. You'll receive an email confirmation once your claim is verified.
          </p>
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-300 space-y-1 text-left">
              <li>• We'll verify your claim within 2-3 business days</li>
              <li>• You'll receive an email with further instructions</li>
              <li>• Once verified, you'll get full access to manage your listing</li>
              <li>• You can update business information, photos, and more</li>
            </ul>
          </div>
          <Button onClick={onCancel} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
            Continue Browsing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-[#00C2FF]" />
          Claim Your Business: {businessName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-400/20 text-blue-400 border-blue-400/30">
            Free Service
          </Badge>
          <Badge variant="secondary" className="bg-green-400/20 text-green-400 border-green-400/30">
            Verified Listing
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2">Why claim your business?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Update business information and contact details</li>
              <li>• Add photos, services, and business hours</li>
              <li>• Respond to reviews and customer inquiries</li>
              <li>• Get verified badge and increased visibility</li>
              <li>• Access analytics and performance insights</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                  <Input 
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                  <Input 
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white" 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-300">Personal Email *</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                <Input 
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Business Details</h3>
              
              <div>
                <Label htmlFor="position" className="text-gray-300">Your Position/Role *</Label>
                <Input 
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g., Owner, Manager, CEO"
                  className="bg-gray-700 border-gray-600 text-white" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="companyEmail" className="text-gray-300">Business Email *</Label>
                <Input 
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  placeholder="Official business email address"
                  className="bg-gray-700 border-gray-600 text-white" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-gray-300">Additional Information</Label>
                <Textarea 
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Any additional details to help verify your claim..."
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white resize-none" 
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Verification Process
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              To verify your claim, we may require additional documentation such as business licenses, 
              utility bills, or other official documents that prove your association with this business.
            </p>
            <p className="text-xs text-gray-400">
              * All information will be kept confidential and used solely for verification purposes.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1 bg-[#00C2FF] hover:bg-[#00A8D8]">
              <Building2 className="w-4 h-4 mr-2" />
              Submit Claim Request
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClaimBusinessForm;
