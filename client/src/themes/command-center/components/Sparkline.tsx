export default function Sparkline() {
  const points = '0,30 20,25 40,28 60,15 80,18 100,8 120,12 140,5';
  return (
    <div>
      <p className="text-xs text-subtle mb-2">System Activity</p>
      <svg viewBox="0 0 140 35" className="w-full h-10" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="url(#cc-spark-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="cc-spark-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--primary))" />
            <stop offset="100%" stopColor="rgb(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
