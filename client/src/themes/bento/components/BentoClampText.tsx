import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

type Props = {
  text: string;
  lines?: number;
  className?: string;
  as?: 'p' | 'span';
};

/**
 * Clamps text to N lines; when it overflows, hover/focus shows the themed tooltip with full copy.
 */
export default function BentoClampText({ text, lines = 4, className, as: Tag = 'p' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [overflowing, setOverflowing] = useState(false);

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
    <Tooltip content={text} enabled={overflowing} className="bmf-tooltip-wide" side="bottom">
      <Tag
        ref={ref as never}
        className={cn(lineClampClass, overflowing && 'cursor-help', className)}
        tabIndex={overflowing ? 0 : undefined}
      >
        {text}
      </Tag>
    </Tooltip>
  );
}
