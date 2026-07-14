import { motion } from 'framer-motion';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import { EducationAttachment } from '@/components/EducationAttachment';
import type { Education, Certification } from '@/types';

export function SpotlightEducationSection({ education }: { education: Education[] }) {
  if (!education.length) return null;
  return (
    <SpotlightSection id="education">
      <SpotlightContainer>
        <SpotlightHeading number="07" title="Education" />
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px spotlight-edu-line" aria-hidden />
          <div className="space-y-6">
            {education.map((edu, i) => (
              <motion.div
                key={edu._id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-12"
              >
                <span className="absolute left-2.5 top-2 h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
                <div className="spotlight-edu-card p-5">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="font-bold text-primary">{edu.degree}</h3>
                    <span className="text-xs font-mono text-accent">
                      {edu.startYear}–{edu.endYear}
                    </span>
                  </div>
                  <p className="text-sm text-accent mt-1">{edu.institution}</p>
                  {edu.location && <p className="text-xs text-subtle mt-1">{edu.location}</p>}
                  {edu.cgpa && <p className="text-sm text-secondary mt-2">CGPA: {edu.cgpa}</p>}
                  <EducationAttachment education={edu} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}

export function SpotlightCertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (!certifications.length) return null;
  return (
    <SpotlightSection id="certifications">
      <SpotlightContainer>
        <SpotlightHeading number="08" title="Certifications" />
        <ul className="space-y-3">
          {certifications.map((cert, i) => (
            <motion.li
              key={cert._id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="spotlight-cert-row flex items-center justify-between gap-4 py-4 px-5"
            >
              <div>
                <h3 className="font-medium text-primary">
                  {cert.url ? (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </h3>
                <p className="text-sm text-subtle">{cert.issuer}</p>
              </div>
              {cert.year && <span className="font-mono text-sm text-accent shrink-0">{cert.year}</span>}
            </motion.li>
          ))}
        </ul>
      </SpotlightContainer>
    </SpotlightSection>
  );
}
