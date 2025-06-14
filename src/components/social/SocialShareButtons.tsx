
import { Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

const SocialShareButtons = ({ url, title }: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  return (
    <div className="flex justify-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        className="border-white text-white hover:bg-white hover:text-slate-900"
        onClick={() => window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer')}
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="border-white text-white hover:bg-white hover:text-slate-900"
        onClick={() => window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer')}
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="border-white text-white hover:bg-white hover:text-slate-900"
        onClick={() => window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer')}
      >
        <Facebook className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShareButtons;
