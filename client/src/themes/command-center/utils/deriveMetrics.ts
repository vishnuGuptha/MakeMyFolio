import type { Certification, Experience, Project, ProfileContent, SkillCategory } from '@/types';

export function parseNumericValue(value: string): number | null {
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export function deriveFallbackStats(
  content: ProfileContent | null,
  projects: Project[],
  skills: SkillCategory[],
  certifications: Certification[],
  experiences: Experience[]
) {
  const skillCount = skills.reduce((acc, cat) => acc + cat.skills.length, 0);
  const jobCount = experiences.filter((e) => e.type === 'job').length;

  return [
    content?.yearsExperience
      ? { label: 'Years Experience', value: `${content.yearsExperience}+` }
      : null,
    { label: 'Projects', value: `${projects.length}+` },
    { label: 'Technologies', value: `${skillCount || '—'}` },
    jobCount > 0 ? { label: 'Roles', value: `${jobCount}+` } : null,
    certifications.length > 0
      ? { label: 'Certifications', value: `${certifications.length}+` }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];
}

export function getDisplayStats(
  stats: { label: string; value: string }[] | undefined,
  content: ProfileContent | null,
  projects: Project[],
  skills: SkillCategory[],
  certifications: Certification[],
  experiences: Experience[]
) {
  if (stats?.length) return stats;
  return deriveFallbackStats(content, projects, skills, certifications, experiences);
}
