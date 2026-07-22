import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PortfolioThemeId } from '@/themes/types';
import type {
  PortfolioData,
  ProfileContent,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
  SiteSettings,
} from '@/types';
import { BRAND } from '@/brand/constants';
import { publicApi } from '@/api';
import { defaultSkillsDisplayStyleForTheme } from '@/themes/shared/skills/types';

/** Color defaults only — keeps the full theme React trees out of this module. */
const THEME_COLOR_DEFAULTS: Record<
  PortfolioThemeId,
  {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    glassStyle: SiteSettings['glassStyle'];
    showStats?: boolean;
  }
> = {
  glass: {
    primaryColor: '#6366f1',
    secondaryColor: '#22d3ee',
    fontFamily: 'dm-sans',
    glassStyle: 'medium',
  },
  spotlight: {
    primaryColor: '#f97316',
    secondaryColor: '#22c55e',
    fontFamily: 'space-grotesk',
    glassStyle: 'subtle',
  },
  terminal: {
    primaryColor: '#4ade80',
    secondaryColor: '#fbbf24',
    fontFamily: 'jetbrains-mono',
    glassStyle: 'subtle',
  },
  'command-center': {
    primaryColor: '#3B82F6',
    secondaryColor: '#22D3EE',
    fontFamily: 'inter',
    glassStyle: 'subtle',
  },
  bento: {
    primaryColor: '#14B8A6',
    secondaryColor: '#CCFBF1',
    fontFamily: 'space-grotesk',
    glassStyle: 'subtle',
  },
  studio: {
    primaryColor: '#68AD0F',
    secondaryColor: '#2F4F4F',
    fontFamily: 'space-grotesk',
    glassStyle: 'subtle',
  },
  olive: {
    primaryColor: '#5E8C50',
    secondaryColor: '#98A1A8',
    fontFamily: 'poppins',
    glassStyle: 'subtle',
  },
};

/** Primary guest draft — localStorage so work survives refresh. */
const STORAGE_KEY = 'buildmyfolio-guest-draft';
/** Legacy session key (migrated on read). */
const LEGACY_SESSION_KEY = 'buildmyfolio-guest-draft';
/** Cross-tab snapshot for /try/preview (kept in sync with STORAGE_KEY). */
const PREVIEW_KEY = 'buildmyfolio-guest-preview';

export type AuthGateReason = 'import' | 'publish' | 'persist';

export type GuestDraft = {
  version: 5;
  themeId: PortfolioThemeId;
  content: {
    name: string;
    title: string;
    tagline: string;
    bio: string;
    location: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    yearsExperience: string;
    profileImageUrl: string;
  };
  skills: { name: string; skillsText: string }[];
  experiences: {
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bulletsText: string;
  }[];
  projects: {
    title: string;
    description: string;
    techStackText: string;
    imageUrl: string;
    liveUrl: string;
    githubUrl: string;
  }[];
  education: {
    degree: string;
    institution: string;
    years: string;
    cgpa: string;
  }[];
  certifications: { name: string; issuer: string; year: string }[];
  workedWith: { name: string }[];
  testimonials: {
    quote: string;
    clientName: string;
    role: string;
    avatarUrl: string;
  }[];
  updatedAt: string;
};

const DEMO_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format';
const DEMO_PROJECT =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_2 =
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_3 =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_4 =
  'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_5 =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_6 =
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_7 =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_8 =
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_9 =
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_10 =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_11 =
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop&auto=format';
const DEMO_PROJECT_12 =
  'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=500&fit=crop&auto=format';
const DEMO_T1 =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format';
const DEMO_T2 =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format';
const DEMO_T3 =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&auto=format';

const THEME_IDS = new Set<string>([
  'glass',
  'spotlight',
  'terminal',
  'command-center',
  'bento',
  'studio',
  'olive',
]);

/** Offline / API-failure fallback — mirrors server defaultTryDemoSeed. */
export function emptyDraft(): GuestDraft {
  return {
    version: 5,
    themeId: 'studio',
    content: {
      name: 'Alex Rivera',
      title: 'Product Designer & Frontend Engineer',
      tagline: 'I design and ship interfaces people enjoy using.',
      bio: `Edit this guest draft to see how ${BRAND.name} feels — create an account to save and publish. Passionate about design systems, performance, and accessible UX. I turn messy product ideas into calm, fast experiences.`,
      location: 'Bengaluru, India',
      email: 'alex@example.com',
      phone: '+91 98765 43210',
      github: 'https://github.com/sindresorhus',
      linkedin: 'https://linkedin.com',
      yearsExperience: '6+',
      profileImageUrl: DEMO_AVATAR,
    },
    skills: [
      {
        name: 'Frontend',
        skillsText: 'React, TypeScript, Next.js, CSS, Tailwind, Framer Motion',
      },
      {
        name: 'Design',
        skillsText: 'Figma, Design systems, Prototyping, Accessibility (WCAG)',
      },
      {
        name: 'Backend & Data',
        skillsText: 'Node.js, Express, MongoDB, REST, GraphQL basics',
      },
      {
        name: 'Tools',
        skillsText: 'Vite, Git, Storybook, Jest, CI/CD, Vercel',
      },
    ],
    experiences: [
      {
        role: 'Senior Frontend Engineer',
        company: 'Acme Labs',
        location: 'Remote',
        startDate: '2022',
        endDate: '',
        isCurrent: true,
        bulletsText:
          'Shipped design systems used by 12 product teams\nImproved Core Web Vitals across marketing sites\nMentored 4 engineers on accessible component patterns',
      },
      {
        role: 'UI Developer',
        company: 'Pixel Co',
        location: 'Bengaluru',
        startDate: '2020',
        endDate: '2022',
        isCurrent: false,
        bulletsText:
          'Built component libraries and marketing microsites\nPartnered with design on responsive layouts\nCut page load time by 35% with image and code splitting',
      },
      {
        role: 'Frontend Intern',
        company: 'Nova Soft',
        location: 'Hyderabad',
        startDate: '2019',
        endDate: '2020',
        isCurrent: false,
        bulletsText: 'Owned landing pages and email templates\nLearned React and TypeScript in production',
      },
    ],
    projects: [
      {
        title: 'Portfolio CMS',
        description: 'A themed portfolio builder with resume import and live preview.',
        techStackText: 'React, Node, MongoDB',
        imageUrl: DEMO_PROJECT,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Analytics Dashboard',
        description: 'Real-time metrics with customizable cards and CSV exports.',
        techStackText: 'TypeScript, D3, Vite',
        imageUrl: DEMO_PROJECT_2,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Design System Kit',
        description: 'Token-driven components with Storybook docs and visual regression tests.',
        techStackText: 'React, Storybook, Chromatic',
        imageUrl: DEMO_PROJECT_3,
        liveUrl: '',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Checkout Flow Redesign',
        description: 'End-to-end checkout UX that cut abandonment and clarified pricing steps.',
        techStackText: 'Figma, React, Stripe',
        imageUrl: DEMO_PROJECT_4,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Team Collaboration Hub',
        description: 'Shared workspace for briefs, comments, and async design reviews.',
        techStackText: 'Next.js, WebSockets, Tailwind',
        imageUrl: DEMO_PROJECT_5,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'API Status Monitor',
        description: 'Uptime, latency charts, and alert rules for multi-region services.',
        techStackText: 'Node, Redis, React',
        imageUrl: DEMO_PROJECT_6,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Dev Docs Portal',
        description: 'Searchable product docs with versioned guides and live code samples.',
        techStackText: 'MDX, Algolia, VitePress',
        imageUrl: DEMO_PROJECT_7,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Hiring Pipeline Board',
        description: 'Kanban for candidates with scorecards, notes, and interview scheduling.',
        techStackText: 'React, DnD Kit, Node',
        imageUrl: DEMO_PROJECT_8,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Mobile Banking App',
        description: 'Pixel-perfect finance flows with biometric login and spend insights.',
        techStackText: 'React Native, TypeScript',
        imageUrl: DEMO_PROJECT_9,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Learning Path Studio',
        description: 'Course builder with modules, quizzes, and progress certificates.',
        techStackText: 'Next.js, Prisma, Postgres',
        imageUrl: DEMO_PROJECT_10,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Brand Asset Library',
        description: 'Centralized logos, tokens, and export presets for marketing teams.',
        techStackText: 'React, Cloudinary, Tailwind',
        imageUrl: DEMO_PROJECT_11,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
      {
        title: 'Marketing Site Builder',
        description: 'Drag-and-drop landing pages with A/B variants and SEO presets.',
        techStackText: 'Vite, React, Node',
        imageUrl: DEMO_PROJECT_12,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com',
      },
    ],
    education: [
      {
        degree: 'B.E. Computer Science',
        institution: 'State University',
        years: '2016 — 2020',
        cgpa: '8.2',
      },
      {
        degree: 'Full-Stack Web Specialization',
        institution: 'Online Academy',
        years: '2021',
        cgpa: '',
      },
      {
        degree: 'Higher Secondary (Science)',
        institution: 'City Public School',
        years: '2014 — 2016',
        cgpa: '92%',
      },
    ],
    certifications: [
      { name: 'React Professional', issuer: 'Meta', year: '2023' },
      { name: 'AWS Cloud Practitioner', issuer: 'Amazon', year: '2022' },
      { name: 'Google UX Design', issuer: 'Coursera', year: '2021' },
      { name: 'Accessibility Fundamentals', issuer: 'Deque', year: '2024' },
    ],
    workedWith: [
      { name: 'Acme Labs' },
      { name: 'Pixel Co' },
      { name: 'Nova Soft' },
      { name: 'Bright Studio' },
    ],
    testimonials: [
      {
        quote:
          'Alex turned our chaotic product briefs into a clean, shipping-ready design system. Velocity jumped overnight.',
        clientName: 'Priya Mehta',
        role: 'Head of Product, Acme Labs',
        avatarUrl: DEMO_T1,
      },
      {
        quote:
          'Rare mix of taste and engineering. The portfolio site they built for us still converts better than paid ads.',
        clientName: 'Jordan Lee',
        role: 'Founder, Pixel Co',
        avatarUrl: DEMO_T2,
      },
      {
        quote:
          'Clear communication, pixel-perfect delivery, and accessibility baked in — not bolted on.',
        clientName: 'Sam Okonkwo',
        role: 'Design Lead, Bright Studio',
        avatarUrl: DEMO_T3,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

/** Sync seed for immediate paint — prefer fetchDemoGuestDraft when possible. */
export function createDemoGuestDraft(themeId?: PortfolioThemeId): GuestDraft {
  const draft = emptyDraft();
  if (themeId) draft.themeId = themeId;
  return draft;
}

function coerceGuestDraft(raw: unknown, themeId?: PortfolioThemeId): GuestDraft | null {
  const migrated = migrateDraft(raw);
  if (!migrated) return null;
  if (themeId) migrated.themeId = themeId;
  if (!THEME_IDS.has(migrated.themeId)) migrated.themeId = 'studio';
  return migrated;
}

/** Load platform-managed /try seed from the API; falls back to emptyDraft. */
export async function fetchDemoGuestDraft(themeId?: PortfolioThemeId): Promise<GuestDraft> {
  try {
    const remote = await publicApi.getTryDemo();
    return coerceGuestDraft(remote, themeId) || createDemoGuestDraft(themeId);
  } catch {
    return createDemoGuestDraft(themeId);
  }
}

function migrateDraft(raw: unknown): GuestDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown> & {
    version?: number;
    themeId?: PortfolioThemeId;
    content?: Record<string, string>;
    skills?: GuestDraft['skills'];
    experiences?: Array<Partial<GuestDraft['experiences'][0]> & { bulletsText?: string }>;
    projects?: Array<Partial<GuestDraft['projects'][0]>>;
    education?: GuestDraft['education'];
    certifications?: GuestDraft['certifications'];
    workedWith?: GuestDraft['workedWith'];
    testimonials?: GuestDraft['testimonials'];
  };

  // Accept v5 (and API seeds with content.name) — merge onto offline fallback shape
  if (d.content?.name) {
    const base = emptyDraft();
    return {
      ...base,
      ...d,
      version: 5,
      themeId: (THEME_IDS.has(String(d.themeId)) ? d.themeId : base.themeId) as PortfolioThemeId,
      content: { ...base.content, ...d.content },
      skills: Array.isArray(d.skills) && d.skills.length ? d.skills : base.skills,
      experiences:
        Array.isArray(d.experiences) && d.experiences.length
          ? (d.experiences as GuestDraft['experiences'])
          : base.experiences,
      projects:
        Array.isArray(d.projects) && d.projects.length
          ? (d.projects as GuestDraft['projects'])
          : base.projects,
      education:
        Array.isArray(d.education) && d.education.length ? d.education : base.education,
      certifications:
        Array.isArray(d.certifications) && d.certifications.length
          ? d.certifications
          : base.certifications,
      workedWith:
        Array.isArray(d.workedWith) && d.workedWith.length ? d.workedWith : base.workedWith,
      testimonials:
        Array.isArray(d.testimonials) && d.testimonials.length
          ? d.testimonials
          : base.testimonials,
      updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : new Date().toISOString(),
    };
  }

  if (d.content) {
    return emptyDraft();
  }
  return null;
}

function readDraft(): GuestDraft | null {
  try {
    const fromLocal =
      localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREVIEW_KEY);
    if (fromLocal) {
      return migrateDraft(JSON.parse(fromLocal));
    }
  } catch {
    /* ignore */
  }
  try {
    const fromSession =
      sessionStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (fromSession) {
      const migrated = migrateDraft(JSON.parse(fromSession));
      if (migrated) writeDraft(migrated);
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeDraft(draft: GuestDraft) {
  const raw = JSON.stringify(draft);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    localStorage.setItem(PREVIEW_KEY, raw);
  } catch {
    /* quota / private mode — fall back to session */
    try {
      sessionStorage.setItem(STORAGE_KEY, raw);
    } catch {
      /* ignore */
    }
  }
  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function clearDraftStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREVIEW_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Persist draft for a new-tab full preview (and keep editor session in sync). */
export function writeGuestPreviewSnapshot(draft: GuestDraft) {
  writeDraft(draft);
}

/** Read draft for /try/preview — prefers cross-tab localStorage snapshot. */
export function readGuestPreviewDraft(): GuestDraft | null {
  try {
    const fromPreview = localStorage.getItem(PREVIEW_KEY);
    if (fromPreview) {
      const migrated = migrateDraft(JSON.parse(fromPreview));
      if (migrated) return migrated;
    }
  } catch {
    /* ignore */
  }
  return readDraft();
}

type GuestCtx = {
  draft: GuestDraft;
  setDraft: (updater: GuestDraft | ((prev: GuestDraft) => GuestDraft)) => void;
  resetDraft: () => void;
  clearDraft: () => void;
  seedReady: boolean;
  authGate: AuthGateReason | null;
  requireAuth: (reason: AuthGateReason) => void;
  closeAuthGate: () => void;
  hasCustomized: boolean;
};

const GuestDraftContext = createContext<GuestCtx | null>(null);

export function GuestDraftProvider({ children }: { children: ReactNode }) {
  const [seedReady, setSeedReady] = useState(false);
  const [baseline, setBaseline] = useState(() => JSON.stringify(emptyDraft()));
  const [draft, setDraftState] = useState<GuestDraft>(() => readDraft() || emptyDraft());
  const [authGate, setAuthGate] = useState<AuthGateReason | null>(null);
  const [hadLocalDraft] = useState(() => Boolean(readDraft()));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seed = await fetchDemoGuestDraft();
      if (cancelled) return;
      setBaseline(JSON.stringify(seed));
      if (!hadLocalDraft) {
        setDraftState(seed);
        writeDraft(seed);
      }
      setSeedReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hadLocalDraft]);

  useEffect(() => {
    writeDraft({ ...draft, updatedAt: new Date().toISOString() });
  }, [draft]);

  const setDraft = useCallback((updater: GuestDraft | ((prev: GuestDraft) => GuestDraft)) => {
    setDraftState((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const resetDraft = useCallback(() => {
    void (async () => {
      const next = await fetchDemoGuestDraft();
      setBaseline(JSON.stringify(next));
      setDraftState(next);
      writeDraft(next);
    })();
  }, []);

  const clearDraft = useCallback(() => {
    clearDraftStorage();
    void (async () => {
      const next = await fetchDemoGuestDraft();
      setBaseline(JSON.stringify(next));
      setDraftState(next);
      writeDraft(next);
    })();
  }, []);

  const hasCustomized = useMemo(() => {
    const { updatedAt: _a, ...rest } = draft;
    const { updatedAt: _b, ...base } = JSON.parse(baseline) as GuestDraft;
    return JSON.stringify(rest) !== JSON.stringify(base);
  }, [draft, baseline]);

  const value: GuestCtx = {
    draft,
    setDraft,
    resetDraft,
    clearDraft,
    seedReady,
    authGate,
    requireAuth: setAuthGate,
    closeAuthGate: () => setAuthGate(null),
    hasCustomized,
  };

  return <GuestDraftContext.Provider value={value}>{children}</GuestDraftContext.Provider>;
}

export function useGuestDraft() {
  const ctx = useContext(GuestDraftContext);
  if (!ctx) throw new Error('useGuestDraft must be used within GuestDraftProvider');
  return ctx;
}

/** Safe for marketing chrome outside GuestDraftProvider (home / pricing). */
export function useOptionalGuestAuthGate() {
  const ctx = useContext(GuestDraftContext);
  return {
    authGate: ctx?.authGate ?? null,
    closeAuthGate: ctx?.closeAuthGate ?? (() => {}),
  };
}

export function peekGuestDraft(): GuestDraft | null {
  return readDraft() || readGuestPreviewDraft();
}

export function clearGuestDraftStorage() {
  clearDraftStorage();
}

export function guestDraftToContent(draft: GuestDraft): Partial<ProfileContent> {
  const c = draft.content;
  return {
    name: c.name,
    title: c.title,
    tagline: c.tagline,
    bio: c.bio,
    location: c.location,
    email: c.email,
    phone: c.phone,
    github: c.github,
    linkedin: c.linkedin,
    yearsExperience: c.yearsExperience,
    profileImageUrl: c.profileImageUrl,
    educationHighlight: draft.education[0]?.degree || '',
    workedWith: (draft.workedWith || []).filter((w) => w.name?.trim()),
    testimonials: (draft.testimonials || [])
      .filter((t) => t.quote?.trim() && t.clientName?.trim())
      .map((t, i) => ({
        quote: t.quote,
        clientName: t.clientName,
        role: t.role || '',
        avatarUrl: t.avatarUrl || '',
        order: i,
      })),
  };
}

export function guestDraftToSkills(draft: GuestDraft): Partial<SkillCategory>[] {
  return draft.skills.map((s, i) => ({
    name: s.name || `Category ${i + 1}`,
    order: i,
    skills: s.skillsText
      .split(',')
      .map((name, j) => ({ name: name.trim(), order: j }))
      .filter((x) => x.name),
  }));
}

export function guestDraftToExperiences(draft: GuestDraft): Partial<Experience>[] {
  return draft.experiences.map((e, i) => ({
    type: 'job' as const,
    role: e.role,
    company: e.company,
    bullets: e.bulletsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean),
    order: i,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    isCurrent: e.isCurrent,
    projects: [],
  }));
}

export function guestDraftToProjects(draft: GuestDraft): Partial<Project>[] {
  return draft.projects.map((p, i) => ({
    title: p.title,
    description: p.description,
    techStack: p.techStackText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    order: i,
    featured: i === 0,
    isPersonalProject: true,
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    imageUrl: p.imageUrl,
    startDate: '',
    endDate: '',
  }));
}

export function guestDraftToEducation(draft: GuestDraft): Partial<Education>[] {
  return draft.education.map((e, i) => {
    const [startYear, endYear] = (e.years || '').split(/[—–-]/).map((s) => s.trim());
    return {
      degree: e.degree,
      institution: e.institution,
      location: '',
      startYear: startYear || '',
      endYear: endYear || '',
      cgpa: e.cgpa,
      status: '',
      url: '',
      imageUrl: '',
      order: i,
    };
  });
}

export function guestDraftToCertifications(draft: GuestDraft): Partial<Certification>[] {
  return draft.certifications.map((c, i) => ({
    name: c.name,
    issuer: c.issuer,
    year: c.year,
    url: '',
    imageUrl: '',
    order: i,
  }));
}

/** Build a full PortfolioData aggregate for theme preview / full guest view */
export function guestDraftToPortfolioData(draft: GuestDraft): PortfolioData {
  const slug =
    draft.content.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'guest';

  // Inline defaults — avoid importing the full theme registry into guest-draft chunk
  const themeDefaults = THEME_COLOR_DEFAULTS[draft.themeId] ?? THEME_COLOR_DEFAULTS.glass;

  const settings: SiteSettings = {
    siteTitle: `${draft.content.name} | ${BRAND.name}`,
    metaDescription: draft.content.tagline,
    ogImageUrl: draft.content.profileImageUrl,
    accentColor: themeDefaults.primaryColor || '#5E8C50',
    primaryColor: themeDefaults.primaryColor || '#5E8C50',
    secondaryColor: themeDefaults.secondaryColor || '#98A1A8',
    fontFamily: themeDefaults.fontFamily || 'dm-sans',
    layoutMode: 'single-page',
    glassStyle: themeDefaults.glassStyle || 'medium',
    portfolioTheme: draft.themeId,
    sectionVisibility: {},
    analyticsId: '',
    showStats: themeDefaults.showStats !== false,
    showAiStrip: false,
    showTestimonials: true,
    showBlog: false,
    showNavHireMe: false,
    showSectionNumbers: false,
    cursorEffect: 'none',
    projectPreviewMode: 'image',
    projectWebviewSlowScroll: false,
    skillsDisplayStyle: defaultSkillsDisplayStyleForTheme(draft.themeId),
    accessLockEnabled: false,
    faviconStyle: 'auto',
  };

  const content: ProfileContent = {
    name: draft.content.name,
    title: draft.content.title,
    tagline: draft.content.tagline,
    bio: draft.content.bio,
    location: draft.content.location,
    email: draft.content.email,
    phone: draft.content.phone,
    github: draft.content.github,
    linkedin: draft.content.linkedin,
    portfolioUrl: '',
    yearsExperience: draft.content.yearsExperience,
    educationHighlight: draft.education[0]?.degree || '',
    profileImageUrl: draft.content.profileImageUrl,
    resumeUrl: '',
    stats: [
      { label: 'Years', value: draft.content.yearsExperience || '3+' },
      { label: 'Projects', value: String(Math.max(draft.projects.length, 1)) },
      { label: 'Skills', value: String(draft.skills.reduce((n, s) => n + s.skillsText.split(',').filter(Boolean).length, 0) || 5) },
    ],
    aiTools: [],
    workedWith: (draft.workedWith || []).filter((w) => w.name?.trim()),
    testimonials: (draft.testimonials || [])
      .filter((t) => t.quote?.trim() && t.clientName?.trim())
      .map((t, i) => ({
        quote: t.quote,
        clientName: t.clientName,
        role: t.role || '',
        avatarUrl: t.avatarUrl || '',
        order: i,
      })),
  };

  const skills = guestDraftToSkills(draft).map((s, i) => ({
    _id: `guest-skill-${i}`,
    name: s.name || '',
    order: s.order ?? i,
    skills: s.skills || [],
  }));

  const experiences = guestDraftToExperiences(draft).map((e, i) => ({
    _id: `guest-exp-${i}`,
    type: e.type || 'job',
    company: e.company || '',
    role: e.role || '',
    location: e.location || '',
    startDate: e.startDate || '',
    endDate: e.endDate || '',
    isCurrent: e.isCurrent || false,
    bullets: e.bullets || [],
    projects: [],
    order: e.order ?? i,
  })) as Experience[];

  const projects = guestDraftToProjects(draft).map((p, i) => ({
    _id: `guest-proj-${i}`,
    title: p.title || '',
    description: p.description || '',
    techStack: p.techStack || [],
    liveUrl: p.liveUrl || '',
    githubUrl: p.githubUrl || '',
    imageUrl: p.imageUrl || '',
    featured: p.featured ?? i === 0,
    isPersonalProject: p.isPersonalProject ?? true,
    order: p.order ?? i,
    startDate: '',
    endDate: '',
  })) as Project[];

  const education = guestDraftToEducation(draft).map((e, i) => ({
    _id: `guest-edu-${i}`,
    degree: e.degree || '',
    institution: e.institution || '',
    location: e.location || '',
    startYear: e.startYear || '',
    endYear: e.endYear || '',
    cgpa: e.cgpa || '',
    status: e.status || '',
    url: '',
    imageUrl: '',
    order: e.order ?? i,
  })) as Education[];

  const certifications = guestDraftToCertifications(draft).map((c, i) => ({
    _id: `guest-cert-${i}`,
    name: c.name || '',
    issuer: c.issuer || '',
    year: c.year || '',
    url: '',
    imageUrl: '',
    order: c.order ?? i,
  })) as Certification[];

  return {
    profile: {
      id: 'guest',
      slug,
      displayName: draft.content.name || 'Guest',
      isPublished: false,
      isDefault: false,
      updatedAt: draft.updatedAt,
    },
    content,
    settings,
    skills,
    experiences,
    projects,
    education,
    certifications,
  };
}
