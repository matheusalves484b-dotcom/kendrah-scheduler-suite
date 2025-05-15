
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionPath?: string;
}

const DashboardHeader = ({ 
  title, 
  subtitle, 
  actionLabel, 
  actionPath 
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-kendrah-black">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      
      {actionLabel && actionPath && (
        <Link to={actionPath} className="mt-4 sm:mt-0">
          <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default DashboardHeader;
