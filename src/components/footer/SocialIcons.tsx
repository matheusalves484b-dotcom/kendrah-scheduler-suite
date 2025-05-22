
import { Facebook, Instagram, Twitter } from 'lucide-react';

interface SocialIconsProps {
  className?: string;
}

const SocialIcons = ({ className = "" }: SocialIconsProps) => {
  return (
    <div className={`flex space-x-4 mt-4 md:mt-0 bg-transparent ${className}`}>
      <a 
        href="https://facebook.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Facebook" 
        className="text-gray-400 hover:text-[#7D3C98] transition-colors"
      >
        <Facebook className="h-5 w-5" />
      </a>
      <a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Instagram" 
        className="text-gray-400 hover:text-[#7D3C98] transition-colors"
      >
        <Instagram className="h-5 w-5" />
      </a>
      <a 
        href="https://twitter.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Twitter" 
        className="text-gray-400 hover:text-[#7D3C98] transition-colors"
      >
        <Twitter className="h-5 w-5" />
      </a>
    </div>
  );
};

export default SocialIcons;
