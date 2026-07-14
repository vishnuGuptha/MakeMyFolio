import type { Project } from '@/types';

/** Pick up to `limit` projects: featured first, then by order. */
export function pickFeaturedProjects(projects: Project[] | undefined, limit = 4): Project[] {
  if (!projects?.length) return [];
  const sorted = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
  return sorted.slice(0, limit);
}
