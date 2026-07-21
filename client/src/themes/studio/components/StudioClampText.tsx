import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

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
    return () => ro.disconnect();
  }, [measure, text, lines]);

  const clamp =
    lines === 2 ? 'line-clamp-2' : lines === 4 ? 'line-clamp-4' : 'line-clamp-3';

  return (
    <Tooltip content={text} enabled={overflowing} className="bmf-tooltip-wide" side="bottom">
      <p
        ref={ref}
        className={cn(clamp, overflowing && 'cursor-help', className)}
        tabIndex={overflowing ? 0 : undefined}
      >
        {text}
      </p>
    </Tooltip>
  );
}
