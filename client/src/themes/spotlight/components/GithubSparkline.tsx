import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

function githubUsername(url?: string): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
    if (!/github\.com$/i.test(u.hostname) && u.hostname !== 'www.github.com') return null;
    const part = u.pathname.split('/').filter(Boolean)[0];
    if (!part || part === '') return null;
    if (['settings', 'features', 'topics', 'collections', 'explore'].includes(part.toLowerCase())) return null;
    return part;
  } catch {
    return null;
  }
}

type Day = { date: string; count: number; level?: number };

/** Contribution sparkline from public GitHub contributions API (opt-in via profile github URL). */
export default function GithubSparkline({
  githubUrl,
  className,
}: {
  githubUrl?: string;
  className?: string;
}) {
  const user = useMemo(() => githubUsername(githubUrl), [githubUrl]);
  const [days, setDays] = useState<Day[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ctrl = new AbortController();
    setError(false);
    setDays(null);
    fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`, {
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error('fail');
        return r.json();
      })
      .then((data: { contributions?: Day[] }) => {
        const list = Array.isArray(data.contributions) ? data.contributions : [];
        setDays(list.slice(-112));
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setError(true);
      });
    return () => ctrl.abort();
  }, [user]);

  if (!user || error || (days && days.length === 0)) return null;

  const max = Math.max(1, ...(days ?? []).map((d) => d.count));

  return (
    <div className={cn('spotlight-github-spark', className)}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[10px] uppercase tracking-widest text-subtle">GitHub · @{user}</p>
        <a
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-accent hover:underline"
        >
          Profile
        </a>
      </div>
      {!days ? (
        <div className="h-10 rounded bg-muted/30 animate-pulse" aria-hidden />
      ) : (
        <div className="spotlight-github-bars" role="img" aria-label={`${user} recent GitHub contributions`}>
          {days.map((d) => {
            const h = Math.max(8, Math.round((d.count / max) * 100));
            return (
              <span
                key={d.date}
                title={`${d.date}: ${d.count}`}
                style={{ height: `${h}%` }}
                className="spotlight-github-bar"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
