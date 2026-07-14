import type { SkillCategory } from '@/types';

export default function SkillRadar({ skills }: { skills: SkillCategory[] }) {
  const names = skills
    .flatMap((cat) => cat.skills.sort((a, b) => a.order - b.order).map((s) => s.name))
    .slice(0, 6);

  if (names.length < 3) return null;

  const cx = 80;
  const cy = 80;
  const r = 55;
  const n = names.length;
  const points = names.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pr = r * (0.6 + (i % 3) * 0.15);
    return `${cx + Math.cos(angle) * pr},${cy + Math.sin(angle) * pr}`;
  });

  const gridPoints = names.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-subtle mb-3">Skill Matrix</p>
      <svg viewBox="0 0 160 160" className="w-full max-w-[160px] mx-auto">
        <polygon points={gridPoints.join(' ')} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <polygon
          points={points.join(' ')}
          fill="rgba(59,130,246,0.2)"
          stroke="rgb(var(--secondary))"
          strokeWidth="1.5"
        />
        {names.map((name, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const lx = cx + Math.cos(angle) * (r + 14);
          const ly = cy + Math.sin(angle) * (r + 14);
          return (
            <text
              key={name}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#94a3b8] text-[7px]"
            >
              {name.length > 8 ? `${name.slice(0, 7)}…` : name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
