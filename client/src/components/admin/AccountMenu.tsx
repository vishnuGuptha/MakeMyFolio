import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, KeyRound, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

function initials(name?: string | null, email?: string | null) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

type AccountMenuProps = {
  name?: string | null;
  email?: string | null;
  /** When set, shows “Change password” linking here */
  accountPath?: string;
  onSignOut: () => void;
  className?: string;
};

/** Header account control: theme, password, sign out. */
export function AccountMenu({
  name,
  email,
  accountPath,
  onSignOut,
  className,
}: AccountMenuProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const label = name || email || 'Account';

  const syncPos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  useEffect(() => {
    if (!open) return;
    syncPos();
    const onReposition = () => syncPos();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={cn('relative', className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          'flex h-8 items-center gap-2 rounded-lg border border-[#0066FF]/15 bg-elevated/80 px-2 text-left transition-colors',
          'hover:border-[#0066FF]/30 hover:bg-muted dark:border-border',
          open && 'border-[#0066FF]/35 ring-2 ring-[#0066FF]/15'
        )}
      >
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0066FF]/12 text-[10px] font-semibold text-[#0066FF] ring-1 ring-[#0066FF]/15"
          aria-hidden
        >
          {initials(name, email)}
        </span>
        <span className="hidden max-w-[8rem] truncate text-xs font-medium text-secondary sm:inline">
          {label}
        </span>
        <ChevronDown
          className={cn(
            'hidden h-3.5 w-3.5 shrink-0 text-subtle transition-transform sm:block',
            open && 'rotate-180'
          )}
        />
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[80]" aria-hidden onClick={close} />
            <div
              role="menu"
              className="fixed z-[90] w-56 overflow-hidden rounded-xl border border-[#0066FF]/14 bg-elevated/95 py-1.5 shadow-[0_20px_48px_-20px_rgb(0_70_180/0.28)] backdrop-blur-md dark:border-white/10"
              style={{ top: pos.top, right: pos.right }}
            >
              <div className="border-b border-[#0066FF]/10 px-3 py-2.5 dark:border-white/10">
                <p className="truncate text-sm font-medium text-primary">{name || 'Account'}</p>
                {email ? <p className="truncate text-[11px] text-subtle">{email}</p> : null}
              </div>

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-secondary transition-colors hover:bg-muted hover:text-primary"
                onClick={() => {
                  toggleTheme();
                }}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-[#0066FF]" />
                ) : (
                  <Moon className="h-4 w-4 text-[#0066FF]" />
                )}
                <span className="flex-1">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                <span className="text-[10px] uppercase tracking-wide text-subtle">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

              {accountPath ? (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-secondary transition-colors hover:bg-muted hover:text-primary"
                  onClick={() => {
                    close();
                    navigate(accountPath);
                  }}
                >
                  <KeyRound className="h-4 w-4" />
                  Change password
                </button>
              ) : null}

              <div className="my-1 border-t border-[#0066FF]/10 dark:border-white/10" />

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                onClick={() => {
                  close();
                  onSignOut();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
