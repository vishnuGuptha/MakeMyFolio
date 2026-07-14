import { useEffect, useState } from 'react';
import { parseNumericValue } from '../utils/deriveMetrics';

export default function CountUp({
  value,
  suffix = '',
}: {
  value: string;
  suffix?: string;
}) {
  const numeric = parseNumericValue(value);
  const [display, setDisplay] = useState(numeric !== null ? 0 : null);

  useEffect(() => {
    if (numeric === null) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(numeric);
      return;
    }
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(numeric * t * 10) / 10);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric]);

  if (numeric === null) return <>{value}</>;

  const rest = value.replace(String(numeric), '').trim();
  return (
    <>
      {display}
      {rest || suffix}
    </>
  );
}
