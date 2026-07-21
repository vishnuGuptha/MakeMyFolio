import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

/** App chrome light/dark toggle (not portfolio personalization). */
export function AppThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Light mode' : 'Dark mode';

  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-elevated/50 text-secondary transition-colors hover:bg-muted hover:text-primary',
          className
        )}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </Tooltip>
  );
}
