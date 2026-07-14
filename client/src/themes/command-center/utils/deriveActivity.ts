import type { Certification, Experience, Project } from '@/types';

export interface ActivityItem {
  id: string;
  label: string;
  detail: string;
  sortKey: number;
}

export function deriveActivity(
  experiences: Experience[],
  projects: Project[],
  certifications: Certification[],
  limit = 5
): ActivityItem[] {
  const items: ActivityItem[] = [];

  experiences.forEach((exp) => {
    const year = exp.isCurrent
      ? new Date().getFullYear()
      : exp.endDate
        ? new Date(exp.endDate).getFullYear()
        : new Date(exp.startDate).getFullYear();
    items.push({
      id: `exp-${exp._id}`,
      label: exp.type === 'internship' ? 'Internship started' : 'Joined team',
      detail: `${exp.role} @ ${exp.company}`,
      sortKey: year * 100 + (exp.order ?? 0),
    });
  });

  projects.slice(0, 6).forEach((proj) => {
    items.push({
      id: `proj-${proj._id}`,
      label: proj.featured ? 'Featured project' : 'Project shipped',
      detail: proj.title,
      sortKey: (proj.order ?? 0) + 50,
    });
  });

  certifications.forEach((cert) => {
    items.push({
      id: `cert-${cert._id}`,
      label: 'Certification earned',
      detail: `${cert.name} (${cert.year})`,
      sortKey: parseInt(cert.year, 10) * 100 || 0,
    });
  });

  return items.sort((a, b) => b.sortKey - a.sortKey).slice(0, limit);
}
