import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import { fadeSlideLeft, fadeUp } from '../motion';
import type { Experience } from '@/types';

/** Extract a 4-digit year from free-form dates like "Dec 2025", "2025-01", "2022". */
function extractYear(raw?: string): string {
  if (!raw?.trim()) return '';
  const m = raw.trim().match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}

/** Short rail label: `2025–` (current), `2023–25`, or single year. */
function yearLabel(exp: Experience): string {
  const startY = extractYear(exp.startDate);
  if (exp.isCurrent) return startY ? `${startY}–` : 'Now';
  const endY = extractYear(exp.endDate);
  if (startY && endY && startY !== endY) return `${startY}–${endY.slice(2)}`;
  return startY || endY || '—';
}

/** Full range for the date pill — keep owner-entered strings, normalize Present. */
function datePillLabel(exp: Experience): string {
  const start = exp.startDate?.trim() || '';
  if (exp.isCurrent) return start ? `${start} — Present` : 'Present';
  const end = exp.endDate?.trim() || '';
  if (start && end) return `${start} — ${end}`;
  return start || end || '—';
}

/** Prefer bullets that look impact/metric-led (numbers, %, +, currency). */
function rankBullet(text: string): number {
  let score = 0;
  if (/\d/.test(text)) score += 2;
  if (/%|\$|₹|€|£|\b\d+x\b|\b\d+\+|improved|reduced|increased|shipped|launched|grew/i.test(text)) {
    score += 3;
  }
  if (/^(developed|worked|responsible|helped|assisted|using)\b/i.test(text.trim())) score -= 1;
  return score;
}

function orderBulletsImpactFirst(bullets: string[]): string[] {
  return [...bullets]
    .map((text, index) => ({ text, index, score: rankBullet(text) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((b) => b.text);
}

const PREVIEW_COUNT = 3;

function ExperienceBullets({ bullets }: { bullets: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const ordered = orderBulletsImpactFirst(bullets);
  const needsCollapse = ordered.length > PREVIEW_COUNT;
  const visible = expanded || !needsCollapse ? ordered : ordered.slice(0, PREVIEW_COUNT);

  return (
    <div className="mb-4">
      <ul className="space-y-2.5 list-none m-0 p-0">
        {visible.map((bullet, j) => (
          <li key={`${j}-${bullet.slice(0, 24)}`} className="text-sm text-secondary flex gap-2.5 items-start">
            <span className="spotlight-exp-bullet mt-1.5 shrink-0" aria-hidden />
            <span className="flex-1 leading-relaxed">{bullet}</span>
          </li>
        ))}
      </ul>
      {needsCollapse ? (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-accent hover:underline"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `Show more (${ordered.length - PREVIEW_COUNT})`}
        </button>
      ) : null}
    </div>
  );
}

function ExperienceTimeline({
  items,
  title,
  number,
}: {
  items: Experience[];
  title: string;
  number: string;
}) {
  const reduceMotion = useReducedMotion();
  if (!items.length) return null;

  return (
    <SpotlightSection id={title.toLowerCase().replace(/\s/g, '-')}>
      <SpotlightContainer>
        <SpotlightHeading number={number} title={title} />
        <div className="spotlight-timeline">
          {items.map((exp, i) => (
            <motion.div
              key={exp._id}
              className={`spotlight-timeline-item${exp.isCurrent ? ' is-current' : ''}`}
              variants={reduceMotion ? undefined : i % 2 === 0 ? fadeUp : fadeSlideLeft}
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="spotlight-timeline-year hidden md:block" title={datePillLabel(exp)}>
                {yearLabel(exp)}
              </span>
              <span className="spotlight-timeline-dot" aria-hidden />
              <article className="spotlight-exp-card p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1 flex gap-3 items-start">
                    <span className="spotlight-exp-mark" aria-hidden>
                      {(exp.company || exp.role || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-primary tracking-tight">{exp.role}</h3>
                      <p className="spotlight-exp-company mt-1.5">{exp.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="spotlight-date-pill text-xs font-mono px-3 py-1 rounded-full">
                      {datePillLabel(exp)}
                    </span>
                    {exp.location ? (
                      <span className="text-[11px] text-subtle text-right max-w-[14rem]">{exp.location}</span>
                    ) : null}
                  </div>
                </div>
                {exp.bullets.length > 0 ? <ExperienceBullets bullets={exp.bullets} /> : null}
                {exp.projects.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-border/60">
                    {exp.projects.map((proj) =>
                      proj.url ? (
                        <a
                          key={proj.name}
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="spotlight-exp-project-chip"
                        >
                          {proj.name}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </a>
                      ) : (
                        <span key={proj.name} className="spotlight-exp-project-chip is-muted">
                          {proj.name}
                        </span>
                      )
                    )}
                  </div>
                ) : null}
              </article>
            </motion.div>
          ))}
        </div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}

export default function SpotlightExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job');
  const internships = experiences.filter((e) => e.type === 'internship');

  return (
    <>
      <ExperienceTimeline items={jobs} title="Experience" number="03" />
      <ExperienceTimeline items={internships} title="Internships" number="04" />
    </>
  );
}
