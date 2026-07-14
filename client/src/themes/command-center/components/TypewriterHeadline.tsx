import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function TypewriterHeadline({
  text,
  className,
  speed = 60,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    const timer = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={cn('inline', className)}>
      {displayed}
      {!done && <span className="cc-typewriter-cursor" aria-hidden />}
    </span>
  );
}
