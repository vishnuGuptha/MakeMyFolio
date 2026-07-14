import { cn } from '@/lib/utils';

const TONES = ['orange', 'blue', 'green', 'pink'] as const;
export type StudioTagTone = (typeof TONES)[number];

export function toneFromSeed(seed: string): StudioTagTone {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  return TONES[hash % TONES.length];
}

export default function StudioTag({
  label,
  tone,
  title,
}: {
  label: string;
  tone?: StudioTagTone;
  title?: string;
}) {
  const resolved = tone || toneFromSeed(label);
  return (
    <span className={cn('studio-tag', `studio-tag-${resolved}`)} title={title || label}>
      {label}
    </span>
  );
}
