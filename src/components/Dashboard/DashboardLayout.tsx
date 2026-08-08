
import { ReactNode } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import TrialBanner from '@/components/TrialBanner';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 pt-14 lg:pt-0">

        <TrialBanner />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
