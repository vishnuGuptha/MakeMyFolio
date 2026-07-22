import { useState } from 'react';
import { Lock } from 'lucide-react';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

type PortfolioAccessGateProps = {
  onUnlock: (code: string) => Promise<void>;
  className?: string;
};

export function PortfolioAccessGate({ onUnlock, className }: PortfolioAccessGateProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code.trim()) {
      setError('Please enter the access code');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onUnlock(code.trim());
      setOpen(false);
      setCode('');
    } catch (err) {
      setError(errorMessage(err, 'Invalid access code'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section
        className={cn(
          'mx-auto max-w-lg px-6 py-16 md:py-20 flex flex-col items-center text-center',
          className
        )}
      >
        <div
          className={cn(
            'w-full rounded-2xl border border-border/70 bg-elevated/95 p-8 md:p-10 shadow-xl',
            'ring-1 ring-accent/15'
          )}
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Lock className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">View Full Portfolio</h2>
          <p className="mt-3 text-sm md:text-base text-subtle leading-relaxed">
            Enter your access code to see projects, experience, and more.
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-8 w-full sm:w-auto min-w-[12rem]"
            onClick={() => {
              setError('');
              setOpen(true);
            }}
          >
            <Lock className="h-4 w-4" />
            Unlock Portfolio
          </Button>
        </div>
      </section>

      <DialogRoot
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setError('');
            setCode('');
          }
        }}
      >
        <DialogContent title="Verify Access" className="max-w-md w-[calc(100%-1.5rem)]">
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-subtle text-center">
              Please enter the access code that was shared with you.
            </p>
            <PasswordInput
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter access code"
              autoFocus
              autoComplete="off"
            />
            {error ? <p className="text-sm text-red-500 text-center">{error}</p> : null}
            <Button type="submit" className="w-full" loading={submitting}>
              Verify Access
            </Button>
          </form>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export function unlockStorageKey(slug: string) {
  return `portfolio-unlock-token:${slug}`;
}

export function readUnlockToken(slug: string): string | null {
  try {
    return sessionStorage.getItem(unlockStorageKey(slug));
  } catch {
    return null;
  }
}

export function writeUnlockToken(slug: string, token: string) {
  try {
    sessionStorage.setItem(unlockStorageKey(slug), token);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearUnlockToken(slug: string) {
  try {
    sessionStorage.removeItem(unlockStorageKey(slug));
  } catch {
    /* ignore */
  }
}
