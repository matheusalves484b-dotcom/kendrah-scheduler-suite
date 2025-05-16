
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';

interface TrialBannerProps {
  trialEndDate: Date;
  isSubscribed: boolean;
}

const TrialBanner = ({
  trialEndDate,
  isSubscribed
}: TrialBannerProps) => {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const days = differenceInDays(trialEndDate, new Date());
    setDaysRemaining(days > 0 ? days : 0);
  }, [trialEndDate]);

  // Don't show if subscribed or if manually closed
  if (isSubscribed || !isVisible) return null;
  
  return (
    <div className="bg-kendrah-purple text-white py-2 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm">
        <div className="flex items-center">
          <span className="font-medium">Período de teste: </span>
          <span className="ml-2">
            {daysRemaining > 0 ? (
              <span>Faltam <strong>{daysRemaining} dias</strong> para acabar seu teste</span>
            ) : (
              <span>Seu período de teste <strong>expirou</strong></span>
            )}
          </span>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <Link to="/subscription">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-8 border-white mr-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-50"
            >
              Assinar R$ 39,90/mês
            </Button>
          </Link>
          <button 
            onClick={() => setIsVisible(false)} 
            className="text-white/80 hover:text-white" 
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;
