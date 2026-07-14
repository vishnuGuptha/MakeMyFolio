import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import { educationAttachmentHref } from '@/components/EducationAttachment';
import type { Education, Certification } from '@/types';

export function TerminalEducationSection({ education }: { education: Education[] }) {
  if (!education.length) return null;
  return (
    <TerminalSection id="education">
      <TerminalContainer>
        <TerminalHeading number="07" title="Education" command="cat ~/education.log" />
        <TerminalWindow title="education.log">
          <p className="text-accent text-xs mb-3">$ cat ~/education.log</p>
          <div className="space-y-4">
            {education.map((edu) => {
              const href = educationAttachmentHref(edu);
              return (
                <div key={edu._id} className="terminal-output-line">
                  <p className="text-primary font-semibold">
                    [{edu.startYear}-{edu.endYear}] {edu.degree}
                  </p>
                  <p className="text-accent text-sm pl-2">@ {edu.institution}</p>
                  {edu.location && <p className="text-subtle text-xs pl-2">{edu.location}</p>}
                  {edu.cgpa && <p className="text-secondary text-sm pl-2">CGPA: {edu.cgpa}</p>}
                  {edu.status && <p className="text-accent text-xs pl-2">status: {edu.status}</p>}
                  {href && (
                    <p className="text-xs pl-2 mt-1">
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        attachment → {href}
                      </a>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </TerminalWindow>
      </TerminalContainer>
    </TerminalSection>
  );
}

export function TerminalCertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (!certifications.length) return null;
  return (
    <TerminalSection id="certifications">
      <TerminalContainer>
        <TerminalHeading number="08" title="Certifications" command="ls -l certs/" />
        <TerminalWindow title="~/certs">
          <p className="text-accent text-xs mb-3">$ ls -l certs/</p>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <p key={cert._id} className="terminal-output-line text-sm">
                <span className="text-subtle">{cert.year || '----'}</span>{' '}
                <span className="text-primary">
                  {cert.url ? (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </span>
                <span className="text-secondary"> — {cert.issuer}</span>
              </p>
            ))}
          </div>
        </TerminalWindow>
      </TerminalContainer>
    </TerminalSection>
  );
}
