import { ReactNode } from 'react';

export default function StudioEmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="studio-empty" role="status">
      <p className="font-semibold text-[var(--band-ink,var(--studio-ink))] mb-1">{title}</p>
      {hint && <p>{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
