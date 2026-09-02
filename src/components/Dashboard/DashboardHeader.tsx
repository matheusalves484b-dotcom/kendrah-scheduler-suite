import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionPath?: string;
  onActionClick?: () => void;
}

const DashboardHeader = ({ title, subtitle, actionLabel, actionPath, onActionClick }: DashboardHeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:ml-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para aparência clara' : 'Mudar para aparência escura'}
          title={theme === 'dark' ? 'Aparência clara' : 'Aparência escura'}
          className="h-10 w-10 shrink-0 rounded-xl border-border bg-card text-foreground hover:bg-muted"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {actionLabel && (onActionClick || actionPath) && (
          onActionClick ? (
            <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90" onClick={onActionClick}>
              {actionLabel}
            </Button>
          ) : (
            <Link to={actionPath!}>
              <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">{actionLabel}</Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
