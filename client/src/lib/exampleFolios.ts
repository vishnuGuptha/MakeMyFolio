import { emptyDraft, type GuestDraft } from '@/context/GuestDraftContext';
import type { PortfolioThemeId } from '@/themes/types';

export type ExampleRole = 'engineer' | 'designer' | 'pm';

export type ExampleFolio = {
  id: string;
  role: ExampleRole;
  roleLabel: string;
  name: string;
  title: string;
  tagline: string;
  themeId: PortfolioThemeId;
  themeName: string;
  blurb: string;
};

/** Curated “someone like me” examples — remix seeds the playground. */
export const EXAMPLE_FOLIOS: ExampleFolio[] = [
  {
    id: 'eng-studio',
    role: 'engineer',
    roleLabel: 'Engineer',
    name: 'Priya Nair',
    title: 'Full-Stack Engineer',
    tagline: 'I ship reliable APIs and calm frontends.',
    themeId: 'studio',
    themeName: 'Studio',
    blurb: 'Backend + React, India-based — clean Studio look for hiring managers.',
  },
  {
    id: 'des-glass',
    role: 'designer',
    roleLabel: 'Designer',
    name: 'Jordan Lee',
    title: 'Product Designer',
    tagline: 'Interfaces that feel obvious on first use.',
    themeId: 'glass',
    themeName: 'Glass',
    blurb: 'Design systems and prototyping — Glass theme for portfolio polish.',
  },
  {
    id: 'pm-bento',
    role: 'pm',
    roleLabel: 'Product',
    name: 'Sam Okonkwo',
    title: 'Product Manager',
    tagline: 'I turn fuzzy problems into shipped outcomes.',
    themeId: 'bento',
    themeName: 'Bento',
    blurb: 'Roadmaps, discovery, and metrics — Bento layout for PM storytelling.',
  },
  {
    id: 'eng-terminal',
    role: 'engineer',
    roleLabel: 'Engineer',
    name: 'Dev Patel',
    title: 'Platform Engineer',
    tagline: 'Infrastructure that stays boring in production.',
    themeId: 'terminal',
    themeName: 'Terminal',
    blurb: 'DevOps / platform focus — Terminal theme for a technical vibe.',
  },
  {
    id: 'des-spotlight',
    role: 'designer',
    roleLabel: 'Designer',
    name: 'Mia Chen',
    title: 'Brand & Visual Designer',
    tagline: 'Bold type, quiet systems.',
    themeId: 'spotlight',
    themeName: 'Spotlight',
    blurb: 'Visual identity work — Spotlight for hero-first storytelling.',
  },
  {
    id: 'pm-olive',
    role: 'pm',
    roleLabel: 'Product',
    name: 'Aisha Rahman',
    title: 'Growth Product Lead',
    tagline: 'Experiments that compound.',
    themeId: 'olive',
    themeName: 'Olive',
    blurb: 'Growth loops and activation — Olive for a grounded, editorial feel.',
  },
];

const ROLE_SKILLS: Record<ExampleRole, GuestDraft['skills']> = {
  engineer: [
    { name: 'Languages', skillsText: 'TypeScript, Python, Go, SQL' },
    { name: 'Frontend', skillsText: 'React, Next.js, Tailwind, Vite' },
    { name: 'Backend', skillsText: 'Node.js, Express, PostgreSQL, Redis' },
    { name: 'Ops', skillsText: 'Docker, CI/CD, AWS, Observability' },
  ],
  designer: [
    { name: 'Craft', skillsText: 'Figma, Prototyping, Design systems, Motion' },
    { name: 'Research', skillsText: 'Interviews, Usability tests, Journey maps' },
    { name: 'Frontend', skillsText: 'HTML/CSS, React basics, Accessibility' },
    { name: 'Tools', skillsText: 'FigJam, Storybook, Notion, Linear' },
  ],
  pm: [
    { name: 'Discovery', skillsText: 'Problem framing, User interviews, PRDs' },
    { name: 'Delivery', skillsText: 'Roadmaps, Prioritization, Stakeholder alignment' },
    { name: 'Metrics', skillsText: 'Activation, Retention, Experiment design' },
    { name: 'Tools', skillsText: 'Linear, Amplitude, Figma, Notion' },
  ],
};

/**
 * Build a playground seed from a curated example (keeps demo media/projects, swaps persona).
 */
export function buildExampleGuestDraft(example: ExampleFolio): GuestDraft {
  const base = emptyDraft();
  return {
    ...base,
    themeId: example.themeId,
    content: {
      ...base.content,
      name: example.name,
      title: example.title,
      tagline: example.tagline,
      bio: `${example.blurb} Remix this draft in the playground — edit anything, then create a free account to save and publish.`,
    },
    skills: ROLE_SKILLS[example.role],
    updatedAt: new Date().toISOString(),
  };
}

export function getExampleById(id: string | null | undefined): ExampleFolio | null {
  if (!id) return null;
  return EXAMPLE_FOLIOS.find((e) => e.id === id) ?? null;
}
