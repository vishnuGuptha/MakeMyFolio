import { useEffect, useState } from 'react';

export function useScrollGlow() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setOpacity(Math.max(0.3, 1 - y / 800));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return opacity;
}
