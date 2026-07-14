import { usePortfolioData } from '@/context/PortfolioContext';
import { resolveCursorEffect, type CursorEffectId } from './cursorEffects';
import { useCursorPosition } from './useCursorPosition';

function CursorLayer({
  effect,
  position,
}: {
  effect: CursorEffectId;
  position: { x: number; y: number; intensity: number };
}) {
  const style = {
    left: position.x,
    top: position.y,
    opacity: position.intensity,
  } as const;

  switch (effect) {
    case 'spotlight':
      return <div className="portfolio-cursor-spotlight" aria-hidden style={style} />;
    case 'glow':
      return <div className="portfolio-cursor-glow" aria-hidden style={style} />;
    case 'follower':
      return (
        <>
          <div className="portfolio-cursor-follower-ring" aria-hidden style={style} />
          <div className="portfolio-cursor-follower-dot" aria-hidden style={style} />
        </>
      );
    case 'radial-gradient':
      return <div className="portfolio-cursor-radial-bg" aria-hidden />;
    case 'lighting':
      return <div className="portfolio-cursor-lighting-bg" aria-hidden />;
    case 'aura':
      return <div className="portfolio-cursor-aura" aria-hidden style={style} />;
    case 'hover-spotlight':
      return <div className="portfolio-cursor-hover-spotlight" aria-hidden style={style} />;
    default:
      return null;
  }
}

export default function CursorEffect() {
  const { settings } = usePortfolioData();
  const effect = resolveCursorEffect(settings);
  const position = useCursorPosition(effect);

  if (effect === 'none') return null;

  return <CursorLayer effect={effect} position={position} />;
}
