import { motion } from 'framer-motion';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import { EducationAttachment } from '@/components/EducationAttachment';
import type { Education, Certification } from '@/types';

export function GlassEducationSection({ education }: { education: Education[] }) {
  if (!education.length) return null;
  return (
    <Section id="education">
      <Container>
        <SectionHeading number="07" title="Education" />
        <div className="space-y-6">
          {education.map((edu, i) => (
            <motion.div
              key={edu._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-primary">{edu.degree}</h3>
              <p className="text-accent text-sm mt-1">{edu.institution}</p>
              <p className="font-mono text-xs text-subtle mt-2">
                {edu.startYear} — {edu.endYear}
                {edu.location && ` · ${edu.location}`}
              </p>
              {edu.cgpa && <p className="text-sm text-secondary mt-2">CGPA: {edu.cgpa}</p>}
              {edu.status && (
                <span className="inline-block mt-2 text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {edu.status}
                </span>
              )}
              <EducationAttachment education={edu} />
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function GlassCertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (!certifications.length) return null;
  return (
    <Section id="certifications">
      <Container>
        <SectionHeading number="08" title="Certifications" />
        <div className="grid md:grid-cols-2 gap-4">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-primary">
                  {cert.url ? (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </h3>
                <p className="text-sm text-subtle">{cert.issuer}</p>
              </div>
              {cert.year && <span className="font-mono text-xs text-accent">{cert.year}</span>}
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
