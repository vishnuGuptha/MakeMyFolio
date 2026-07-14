import type { ActivityItem } from '../utils/deriveActivity';

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Recent Activity</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2 text-xs border-l-2 border-[rgb(var(--primary))]/30 pl-3 py-0.5">
            <div>
              <p className="text-primary font-medium">{item.label}</p>
              <p className="text-subtle line-clamp-1">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
