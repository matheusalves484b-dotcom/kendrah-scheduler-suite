
import { ReactNode } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import TrialBanner from '@/components/TrialBanner';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Mock user data for demonstration
  const mockUser = {
    trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    isSubscribed: false
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TrialBanner 
          trialEndDate={mockUser.trialEndsAt}
          isSubscribed={mockUser.isSubscribed}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
