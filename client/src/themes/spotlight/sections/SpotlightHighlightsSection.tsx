import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SpotlightContainer } from '../layout/SpotlightSection';
import { fadeUp } from '../motion';

function parseStat(value: string): { prefix: string; num: number | null; suffix: string } {
  const m = value.trim().match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { prefix: '', num: null, suffix: value };
  return { prefix: m[1], num: Number(m[2]), suffix: m[3] };
}

function CountUpValue({ value }: { value: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const parsed = parseStat(value);
  const [display, setDisplay] = useState(reduceMotion || parsed.num == null ? value : `${parsed.prefix}0${parsed.suffix}`);

  useEffect(() => {
    if (!inView || reduceMotion || parsed.num == null) {
      setDisplay(value);
      return;
    }
    const target = parsed.num;
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const current = Math.round(target * eased * 10) / (Number.isInteger(target) ? 1 : 10);
      setDisplay(`${parsed.prefix}${Number.isInteger(target) ? Math.round(current) : current}${parsed.suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, parsed.num, parsed.prefix, parsed.suffix, value]);

  return (
    <p ref={ref} className="text-3xl font-bold spotlight-stat-value">
      {display}
    </p>
  );
}

export function SpotlightHighlightsSection({
  stats,
  tools,
  showStats = true,
  showAiStrip = true,
}: {
  stats: { label: string; value: string }[];
  tools: string[];
  showStats?: boolean;
  showAiStrip?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const hasStats = showStats && stats?.length > 0;
  const hasAi = showAiStrip && tools?.length > 0;
  if (!hasStats && !hasAi) return null;

  return (
    <section className="py-10">
      <SpotlightContainer className="space-y-4">
        {hasStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={reduceMotion ? undefined : fadeUp}
                initial={reduceMotion ? false : 'hidden'}
                whileInView={reduceMotion ? undefined : 'show'}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="spotlight-stat-card text-center p-5"
              >
                <CountUpValue value={stat.value} />
                <p className="text-[10px] uppercase tracking-widest text-subtle mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        ) : null}

        {hasAi ? (
          <div className="spotlight-ai-strip flex flex-wrap items-center gap-2 px-5 py-4">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider mr-2">Built with</span>
            {tools.map((tool) => (
              <span key={tool} className="spotlight-ai-pill text-xs px-3 py-1 rounded-full">
                {tool}
              </span>
            ))}
          </div>
        ) : null}
      </SpotlightContainer>
    </section>
  );
}
