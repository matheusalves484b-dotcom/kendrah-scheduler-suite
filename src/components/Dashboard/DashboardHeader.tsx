import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionPath?: string;
  onActionClick?: () => void;
}

const DashboardHeader = ({ title, subtitle, actionLabel, actionPath, onActionClick }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actionLabel && (onActionClick || actionPath) && (
        onActionClick ? (
          <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90 mt-4 sm:mt-0" onClick={onActionClick}>{actionLabel}</Button>
        ) : (
          <Link to={actionPath!} className="mt-4 sm:mt-0">
            <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">{actionLabel}</Button>
          </Link>
        )
      )}
    </div>
  );
};

export default DashboardHeader;
