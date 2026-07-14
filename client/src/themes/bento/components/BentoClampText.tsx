import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type Props = {
  text: string;
  lines?: number;
  className?: string;
  as?: 'p' | 'span';
};

/**
 * Clamps text to N lines; when it overflows, hover/focus shows a soft bento tooltip with the full copy.
 */
export default function BentoClampText({ text, lines = 4, className, as: Tag = 'p' }: Props) {
  const ref = useRef<HTMLElement>(null);
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
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, text, lines]);

  const show = () => {
    const el = ref.current;
    if (!el || !overflowing) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(340, Math.max(240, rect.width + 24));
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const below = rect.bottom + 10;
    const approxHeight = 120;
    const top =
      below + approxHeight > window.innerHeight - 12
        ? Math.max(12, rect.top - approxHeight - 10)
        : below;
    setPos({ top, left, width });
    setOpen(true);
  };

  const hide = () => setOpen(false);

  const lineClampClass =
    lines === 2
      ? 'line-clamp-2'
      : lines === 3
        ? 'line-clamp-3'
        : lines === 5
          ? 'line-clamp-5'
          : lines === 6
            ? 'line-clamp-6'
            : 'line-clamp-4';

  return (
    <>
      <Tag
        ref={ref as never}
        className={cn(lineClampClass, overflowing && 'cursor-help', className)}
        tabIndex={overflowing ? 0 : undefined}
        aria-describedby={overflowing && open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {text}
      </Tag>
      {open &&
        overflowing &&
        createPortal(
          <div
            id={tipId}
            role="tooltip"
            className="bento-clamp-tooltip"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <p className="bento-clamp-tooltip-body">{text}</p>
          </div>,
          document.body
        )}
    </>
  );
}
