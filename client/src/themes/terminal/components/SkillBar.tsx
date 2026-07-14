const LEVEL_WIDTH: Record<string, number> = {
  beginner: 4,
  intermediate: 6,
  advanced: 8,
  expert: 10,
};

function barWidth(level?: string): number {
  if (!level) return 8;
  const key = level.toLowerCase();
  if (LEVEL_WIDTH[key]) return LEVEL_WIDTH[key];
  const num = parseInt(level, 10);
  if (!isNaN(num)) return Math.min(10, Math.max(2, Math.round(num / 10)));
  return 8;
}

export default function SkillBar({ name, level }: { name: string; level?: string }) {
  const filled = barWidth(level);
  const empty = 10 - filled;
  const bar = `${'█'.repeat(filled)}${'░'.repeat(empty)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      <span className="text-primary w-28 sm:w-36 shrink-0 truncate">{name}</span>
      <span className="text-accent">[{bar}]</span>
      {level && <span className="text-subtle text-xs">{level}</span>}
    </div>
  );
}
