import type { Certification } from '@/types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';

export default function StudioCertificationsSection({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (!certifications?.length) return null;
  const sorted = [...certifications].sort((a, b) => a.order - b.order);

  return (
    <StudioSection id="certifications" band="light">
      <StudioSectionHeader title="Certifications" />
      <ul className="divide-y divide-[var(--band-border)]">
        {sorted.map((cert) => (
          <li key={cert._id} className="py-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-semibold text-[var(--band-ink)]">{cert.name}</p>
              <p className="studio-mono text-xs text-[var(--band-muted)]">{cert.issuer}</p>
            </div>
            <div className="studio-mono text-xs text-[var(--band-muted)] flex gap-3">
              {cert.year && <span>{cert.year}</span>}
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--band-ink)]">
                  View ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </StudioSection>
  );
}
