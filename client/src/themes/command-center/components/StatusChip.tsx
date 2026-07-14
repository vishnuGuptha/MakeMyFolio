export default function StatusChip({ label }: { label: string }) {
  return (
    <span className="cc-status-chip">
      <span className="cc-status-dot" aria-hidden />
      {label}
    </span>
  );
}
