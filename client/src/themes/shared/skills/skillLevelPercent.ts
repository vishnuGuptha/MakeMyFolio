/** Map free-text skill levels to 0–100 for rings and bars. */
export function skillLevelPercent(level?: string): number {
  if (!level) return 62;
  const raw = level.trim().toLowerCase();
  const pct = raw.match(/(\d+)\s*%?$/);
  if (pct && /^\d/.test(raw.replace(/^(beginner|intermediate|advanced|expert)\s*/i, ''))) {
    const n = Number(pct[1]);
    if (!Number.isNaN(n)) return Math.min(100, Math.max(8, n));
  }
  if (/expert|master|native/.test(raw)) return 94;
  if (/advanced|proficient|senior|strong/.test(raw)) return 82;
  if (/intermediate|working|comfortable/.test(raw)) return 68;
  if (/beginner|basic|familiar|learning|novice/.test(raw)) return 42;
  const num = parseInt(raw, 10);
  if (!Number.isNaN(num)) return Math.min(100, Math.max(8, num));
  return 62;
}
