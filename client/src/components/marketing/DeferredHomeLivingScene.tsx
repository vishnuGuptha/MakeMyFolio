import { useEffect, useState } from 'react';
import { HomeLivingScene } from './HomeLivingScene';

/** Static mesh for first paint — no framer springs / rAF. */
function StaticHomeAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="home-mesh-gradient absolute inset-0" />
      <div className="home-mesh-secondary absolute inset-0" />
      <div className="home-orb home-orb-blue absolute -left-20 top-[8%] h-80 w-80 rounded-full opacity-80" />
      <div className="home-orb home-orb-cyan absolute right-[-5rem] top-[12%] h-[22rem] w-[22rem] rounded-full opacity-80" />
      <div className="home-orb home-orb-indigo absolute right-[12%] top-[42%] h-56 w-56 rounded-full opacity-70" />
      <div className="home-scene-vignette absolute inset-0" />
    </div>
  );
}

/**
 * Defer the full living scene until after first paint / idle so Lighthouse
 * LCP and TBT are not blocked by parallax springs and perpetual rAF.
 */
export function DeferredHomeLivingScene() {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;

    const enable = () => setEnhanced(true);

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(enable, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(enable, 200);
    }

    return () => {
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!enhanced) return <StaticHomeAtmosphere />;
  return <HomeLivingScene />;
}
