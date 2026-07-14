import { motion } from 'framer-motion';
import { CommandCenterContainer, CommandCenterSection, CommandCenterHeading } from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import { EducationAttachment } from '@/components/EducationAttachment';
import type { Education, Certification } from '@/types';

export function CommandCenterEducationSection({ education }: { education: Education[] }) {
  if (!education.length) return null;

  return (
    <CommandCenterSection id="education">
      <CommandCenterContainer>
        <CommandCenterHeading number="07" title="Education" />
        <div className="space-y-4">
          {education.map((edu, i) => (
            <motion.div
              key={edu._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard hover={false} className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-primary">{edu.degree}</h3>
                  <p className="text-accent text-sm">{edu.institution}</p>
                  {edu.location && <p className="text-xs text-subtle mt-1">{edu.location}</p>}
                  <EducationAttachment education={edu} />
                </div>
                <div className="text-right text-sm">
                  <p className="text-subtle">{edu.startYear} — {edu.endYear}</p>
                  {edu.cgpa && <p className="text-accent font-medium mt-1">CGPA: {edu.cgpa}</p>}
                  {edu.status && <p className="text-xs text-subtle mt-1">{edu.status}</p>}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}

export function CommandCenterCertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (!certifications.length) return null;

  return (
    <CommandCenterSection id="certifications">
      <CommandCenterContainer>
        <CommandCenterHeading number="08" title="Certifications" />
        <div className="space-y-3">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover={false} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary">
                    {cert.url ? (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                        {cert.name}
                      </a>
                    ) : (
                      cert.name
                    )}
                  </h3>
                  <p className="text-xs text-subtle">{cert.issuer}</p>
                </div>
                <span className="cc-tech-tag shrink-0">{cert.year}</span>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
