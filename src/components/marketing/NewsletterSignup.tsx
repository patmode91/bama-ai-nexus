
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast.error('Please enter a valid email address.');
        return;
    }
    setLoading(true);
    // Fake delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Subscribing with email: ${email}`);
    toast.info("Newsletter signup functionality is coming soon!");
    setEmail('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-white text-slate-900 border-slate-300"
      />
      <Button type="submit" disabled={loading} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
