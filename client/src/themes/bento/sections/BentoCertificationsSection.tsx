import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import type { Certification } from '@/types';

export default function BentoCertificationsSection({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (!certifications?.length) return null;

  return (
    <BentoSection id="certifications" label="08" title="Certifications">
      <BentoCard className="p-6">
        <ul className="divide-y divide-black/5">
          {[...certifications]
            .sort((a, b) => a.order - b.order)
            .map((cert) => (
              <li key={cert._id} className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--bento-ink)]">{cert.name}</p>
                  <p className="text-xs bento-muted mt-0.5">{cert.issuer}</p>
                </div>
                <div className="text-xs bento-muted flex items-center gap-3">
                  {cert.year && <span>{cert.year}</span>}
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--bento-ink)] hover:opacity-70"
                    >
                      View ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </BentoCard>
    </BentoSection>
  );
}
