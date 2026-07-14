const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  delay: `${(i % 8) * 1.2}s`,
  duration: `${10 + (i % 6)}s`,
}));

export default function ParticleField() {
  return (
    <div className="cc-particles" aria-hidden>
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="cc-particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
