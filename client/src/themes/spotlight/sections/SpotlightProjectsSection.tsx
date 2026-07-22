import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github, X } from 'lucide-react';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import { fadeScale, fadeUp } from '../motion';
import type { Project } from '@/types';

/** Match `md:grid-cols-2 lg:grid-cols-3` for row-based pagination. */
function useProjectGridCols() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setCols(3);
      else if (window.matchMedia('(min-width: 768px)').matches) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cols;
}

function splitCaseCopy(description: string) {
  const parts = description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return { problem: parts[0], approach: parts.slice(1, -1).join(' '), outcome: parts[parts.length - 1] };
  }
  if (parts.length === 2) {
    return { problem: parts[0], approach: parts[1], outcome: 'See live demo and repo for results.' };
  }
  return {
    problem: description || 'Solve a focused product problem with clear UX and performance goals.',
    approach: 'Ship iteratively with a tight stack and measurable feedback loops.',
    outcome: 'Explore the live build and source for the full story.',
  };
}

function ProjectDrawer({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const caseCopy = splitCaseCopy(project.description);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <>
      <button type="button" className="spotlight-drawer-backdrop" aria-label="Close case study" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} case study`}
        className="spotlight-drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-border/50 bg-elevated/95 backdrop-blur">
          <p className="font-semibold text-primary truncate">{project.title}</p>
          <button
            type="button"
            onClick={onClose}
            className="spotlight-icon-btn h-9 w-9 inline-flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <ProjectMediaPreview
            title={project.title}
            imageUrl={project.imageUrl}
            liveUrl={project.liveUrl}
            className="rounded-xl overflow-hidden aspect-[16/10]"
          />
          <div className="space-y-4">
            <div>
              <p className="spotlight-case-kicker mb-1">Problem</p>
              <p className="text-sm text-secondary leading-relaxed">{caseCopy.problem}</p>
            </div>
            <div>
              <p className="spotlight-case-kicker mb-1">Approach</p>
              <p className="text-sm text-secondary leading-relaxed">{caseCopy.approach}</p>
            </div>
            <div>
              <p className="spotlight-case-kicker mb-1">Outcome</p>
              <p className="text-sm text-secondary leading-relaxed">{caseCopy.outcome}</p>
            </div>
          </div>
          {project.techStack.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-cta-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
              >
                Live <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-cta-outline inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Github className="h-3.5 w-3.5" /> Code
              </a>
            ) : null}
          </div>
        </div>
      </motion.aside>
    </>,
    document.body
  );
}

function ProjectBento({
  projects,
  title,
  number,
}: {
  projects: Project[];
  title: string;
  number: string;
}) {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState<Project | null>(null);
  const [visibleRows, setVisibleRows] = useState(2);
  const cols = useProjectGridCols();
  const pageRows = 2;

  const stacks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const t of p.techStack) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([name]) => name);
  }, [projects]);

  const filtered = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.techStack.includes(filter))),
    [projects, filter]
  );

  useEffect(() => {
    setVisibleRows(pageRows);
  }, [filter, cols]);

  const limit = visibleRows * cols;
  const visible = filtered.slice(0, limit);
  const canShowMore = filtered.length > limit;
  const canShowLess = visibleRows > pageRows;
  const remaining = Math.max(0, filtered.length - limit);

  if (!projects.length) return null;

  return (
    <SpotlightSection id={title === 'Featured Projects' ? 'projects' : 'personal-projects'}>
      <SpotlightContainer>
        <SpotlightHeading number={number} title={title} />
        {filter === 'All' && projects.some((p) => p.imageUrl) ? (
          <div className="spotlight-filmstrip mb-6" aria-label="Project filmstrip">
            {projects
              .filter((p) => p.imageUrl)
              .slice(0, 8)
              .map((p) => (
                <button
                  key={p._id}
                  type="button"
                  className="spotlight-filmstrip-frame"
                  onClick={() => setActive(p)}
                  aria-label={`Open case study: ${p.title}`}
                >
                  <img src={p.imageUrl} alt="" loading="lazy" />
                  <span>{p.title}</span>
                </button>
              ))}
          </div>
        ) : null}
        {stacks.length > 1 ? (
          <div className="flex flex-wrap gap-2 mb-6" role="toolbar" aria-label="Filter by stack">
            {['All', ...stacks].map((chip) => (
              <button
                key={chip}
                type="button"
                className={`spotlight-filter-chip ${filter === chip ? 'is-active' : ''}`}
                aria-pressed={filter === chip}
                onClick={() => setFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((proj, i) => (
            <motion.article
              key={proj._id}
              variants={reduceMotion ? undefined : i % 2 === 0 ? fadeUp : fadeScale}
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 8) * 0.05 }}
              className="spotlight-project-card project-card-flat-top group overflow-hidden"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setActive(proj)}
                aria-label={`Open case study: ${proj.title}`}
              >
                <ProjectMediaPreview title={proj.title} imageUrl={proj.imageUrl} liveUrl={proj.liveUrl} />
              </button>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">
                    <button type="button" onClick={() => setActive(proj)} className="text-left hover:underline">
                      {proj.title}
                    </button>
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    {proj.githubUrl ? (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-subtle hover:text-accent"
                        aria-label={`${proj.title} on GitHub`}
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    ) : null}
                    {proj.liveUrl ? (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-subtle hover:text-accent"
                        aria-label={`${proj.title} live site`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-subtle line-clamp-2 mb-3">{proj.description}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {proj.techStack.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent">
                      {t}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActive(proj)}
                    className="ml-auto text-[11px] font-medium text-accent hover:underline"
                  >
                    Case study →
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-subtle py-8">No projects match this filter.</p>
        ) : null}
        {canShowMore || canShowLess ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {canShowMore ? (
              <button
                type="button"
                className="spotlight-cta-outline inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium"
                onClick={() => setVisibleRows((r) => r + pageRows)}
              >
                Show more{remaining > 0 ? ` (${Math.min(remaining, pageRows * cols)})` : ''}
              </button>
            ) : null}
            {canShowLess ? (
              <button
                type="button"
                className="text-sm font-medium text-subtle hover:text-accent transition-colors px-3 py-2"
                onClick={() => setVisibleRows(pageRows)}
              >
                Show less
              </button>
            ) : null}
          </div>
        ) : null}
      </SpotlightContainer>
      <AnimatePresence>
        {active ? <ProjectDrawer key={active._id} project={active} onClose={() => setActive(null)} /> : null}
      </AnimatePresence>
    </SpotlightSection>
  );
}

export default function SpotlightProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured && !p.isPersonalProject);
  const personal = projects.filter((p) => p.isPersonalProject);
  const otherFeatured = projects.filter((p) => p.featured && p.isPersonalProject);

  const displayFeatured = featured.length > 0 ? featured : otherFeatured.slice(0, 2);
  const displayPersonal = personal.length > 0 ? personal : projects.filter((p) => !p.featured);

  return (
    <>
      <ProjectBento projects={displayFeatured} title="Featured Projects" number="05" />
      <ProjectBento projects={displayPersonal} title="Personal Projects" number="06" />
    </>
  );
}
