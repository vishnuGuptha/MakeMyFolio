/** Default public /try demo seed (Alex Rivera). Kept in sync with client emptyDraft fallback. */

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

export type TryDemoSeedPayload = {
  version: 5;
  themeId: string;
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

export function getDefaultTryDemoSeed(): TryDemoSeedPayload {
  return {
    version: 5,
    themeId: 'studio',
    content: {
      name: 'Alex Rivera',
      title: 'Product Designer & Frontend Engineer',
      tagline: 'I design and ship interfaces people enjoy using.',
      bio: 'Edit this guest draft to see how MakeMyFolio feels — create an account to save and publish. Passionate about design systems, performance, and accessible UX. I turn messy product ideas into calm, fast experiences.',
      location: 'Bengaluru, India',
      email: 'alex@example.com',
      phone: '+91 98765 43210',
      github: 'https://github.com',
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
