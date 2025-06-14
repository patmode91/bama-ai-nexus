
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useCreateVerificationRequest } from '@/hooks/useVerification';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VerificationBadgeProps {
  businessId: number;
  isVerified: boolean;
  showRequestButton?: boolean;
}

const VerificationBadge = ({ businessId, isVerified, showRequestButton = false }: VerificationBadgeProps) => {
  const [user, setUser] = useState<any>(null);
  const createRequest = useCreateVerificationRequest();
  const { toast } = useToast();

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

  const handleRequestVerification = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createRequest.mutateAsync({
        business_id: businessId,
      });
      
      toast({
        title: "Verification Requested",
        description: "Your verification request has been submitted for review.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isVerified) {
    return (
      <Badge className="bg-green-600/20 text-green-400 border-green-400/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified Business
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="border-gray-600 text-gray-400">
        <Shield className="w-3 h-3 mr-1" />
        Not Verified
      </Badge>
      {showRequestButton && user && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestVerification}
          disabled={createRequest.isPending}
          className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF]/10"
        >
          <Clock className="w-4 h-4 mr-2" />
          {createRequest.isPending ? 'Requesting...' : 'Request Verification'}
        </Button>
      )}
    </div>
  );
};

export default VerificationBadge;
