export default function BentoMotif({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.25" opacity="0.7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 24 + Math.cos(rad) * 14;
        const y1 = 24 + Math.sin(rad) * 14;
        const x2 = 24 + Math.cos(rad) * 20;
        const y2 = 24 + Math.sin(rad) * 20;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.25"
            opacity="0.5"
          />
        );
      })}
    </svg>
  );
}
