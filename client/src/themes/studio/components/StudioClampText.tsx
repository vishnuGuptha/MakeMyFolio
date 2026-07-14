import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export default function StudioClampText({
  text,
  lines = 3,
  className,
}: {
  text: string;
  lines?: number;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const tipId = useId();
  const [overflowing, setOverflowing] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, text, lines]);

  const show = () => {
    const el = ref.current;
    if (!el || !overflowing) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(360, Math.max(240, rect.width));
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const top = Math.min(rect.bottom + 8, window.innerHeight - 120);
    setPos({ top, left, width });
    setOpen(true);
  };

  const clamp =
    lines === 2 ? 'line-clamp-2' : lines === 4 ? 'line-clamp-4' : 'line-clamp-3';

  return (
    <>
      <p
        ref={ref}
        className={cn(clamp, overflowing && 'cursor-help', className)}
        tabIndex={overflowing ? 0 : undefined}
        aria-describedby={overflowing && open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
      >
        {text}
      </p>
      {open &&
        overflowing &&
        createPortal(
          <div
            id={tipId}
            role="tooltip"
            className="fixed z-[80] rounded-xl border border-black/10 bg-zinc-50 px-3.5 py-3 text-xs leading-relaxed text-zinc-700 shadow-xl"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
