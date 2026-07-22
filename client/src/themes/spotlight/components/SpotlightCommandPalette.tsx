import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Command, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVisibleNavSections } from '@/lib/theme';
import { publicApi } from '@/api';
import { useTheme } from '@/context/ThemeContext';

type CmdItem = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

export default function SpotlightCommandPalette({
  slug,
  resumeUrl,
  sectionVisibility,
}: {
  slug?: string;
  resumeUrl?: string;
  sectionVisibility?: Record<string, boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      const target = id === 'home' ? 'hero' : id;
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      close();
    },
    [close]
  );

  const items = useMemo<CmdItem[]>(() => {
    const nav = getVisibleNavSections(sectionVisibility);
    const list: CmdItem[] = [
      { id: 'home', label: 'Go to Home', hint: 'Hero', run: () => scrollTo('home') },
      ...nav.map((s) => ({
        id: s.id,
        label: `Go to ${s.label}`,
        hint: 'Section',
        run: () => scrollTo(s.id),
      })),
      {
        id: 'contact',
        label: 'Go to Contact',
        hint: 'Section',
        run: () => scrollTo('contact'),
      },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        hint: 'Theme',
        run: () => {
          toggleTheme();
          close();
        },
      },
    ];
    if (resumeUrl && slug) {
      list.push({
        id: 'resume',
        label: 'Download resume',
        hint: 'File',
        run: () => {
          window.open(publicApi.getResumeUrl(slug, true), '_blank');
          close();
        },
      });
    }
    return list;
  }, [sectionVisibility, scrollTo, theme, toggleTheme, close, resumeUrl, slug]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && filtered[active]) {
        e.preventDefault();
        filtered[active].run();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('spotlight:cmdk', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('spotlight:cmdk', onOpen);
    };
  }, [open, close, filtered, active]);

  useEffect(() => {
    if (!open) return;
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  return createPortal(
    <div className="spotlight-cmdk" role="presentation">
      <button type="button" className="spotlight-cmdk-backdrop" aria-label="Close command palette" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="spotlight-cmdk-panel"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <Search className="h-4 w-4 text-subtle shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section…"
            className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-subtle"
            aria-autocomplete="list"
            aria-controls="spotlight-cmdk-list"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-subtle border border-border/60 rounded px-1.5 py-0.5">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
        <ul id="spotlight-cmdk-list" role="listbox" className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-sm text-subtle text-center">No matches</li>
          ) : (
            filtered.map((item, i) => (
              <li key={item.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={cn('spotlight-cmdk-item', i === active && 'is-active')}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => item.run()}
                >
                  <span>{item.label}</span>
                  {item.hint ? <span className="text-[10px] uppercase tracking-wide text-subtle">{item.hint}</span> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>,
    document.body
  );
}
