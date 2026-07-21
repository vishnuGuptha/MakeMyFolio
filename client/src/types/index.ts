export interface PortfolioProfile {
  _id: string;
  slug: string;
  displayName: string;
  isPublished: boolean;
  isDefault: boolean;
  /** ISO date when moved to bin; null/undefined when active */
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileContent {
  _id?: string;
  name: string;
  title: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolioUrl: string;
  github: string;
  bio: string;
  yearsExperience: string;
  educationHighlight: string;
  profileImageUrl: string;
  resumeUrl: string;
  stats: { label: string; value: string }[];
  aiTools: string[];
  workedWith?: { name: string; logoUrl?: string }[];
  testimonials?: {
    quote: string;
    clientName: string;
    avatarUrl?: string;
    role?: string;
    order?: number;
  }[];
}

export type ProjectPreviewMode = 'image' | 'webview';

export interface SiteSettings {
  _id?: string;
  siteTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layoutMode: 'single-page' | 'multi-page';
  glassStyle: 'subtle' | 'medium' | 'strong';
  portfolioTheme: 'glass' | 'spotlight' | 'terminal' | 'command-center' | 'bento' | 'studio' | 'olive';
  sectionVisibility: Record<string, boolean>;
  analyticsId: string;
  showStats: boolean;
  showAiStrip: boolean;
  showTestimonials: boolean;
  showBlog: boolean;
  /** @deprecated use cursorEffect */
  showCursorGlow?: boolean;
  cursorEffect:
    | 'none'
    | 'spotlight'
    | 'glow'
    | 'follower'
    | 'radial-gradient'
    | 'lighting'
    | 'aura'
    | 'hover-spotlight';
  /** Project card media: CMS image vs live frontpage webview */
  projectPreviewMode: ProjectPreviewMode;
  /** Slowly pan/scroll the webview preview to reveal more of the page */
  projectWebviewSlowScroll: boolean;
}

export interface SkillItem {
  name: string;
  level?: string;
  order: number;
}

export interface SkillCategory {
  _id: string;
  name: string;
  order: number;
  skills: SkillItem[];
}

export interface JobProject {
  name: string;
  url: string;
  techStack: string[];
}

export interface Experience {
  _id: string;
  type: 'job' | 'internship';
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
  projects: JobProject[];
  order: number;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  featured: boolean;
  isPersonalProject: boolean;
  order: number;
  startDate: string;
  endDate: string;
}

export interface Education {
  _id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  cgpa: string;
  status: string;
  /** External link (degree portal, marksheet, appreciation letter, etc.) */
  url: string;
  /** Screenshot or document (image/PDF) for the degree / marksheet */
  imageUrl: string;
  order: number;
}

export interface Certification {
  _id: string;
  name: string;
  issuer: string;
  year: string;
  url: string;
  /** Screenshot or document (image/PDF) of the certificate */
  imageUrl: string;
  order: number;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  archived: boolean;
  pinned?: boolean;
  pinnedAt?: string | null;
  contacted?: boolean;
  createdAt: string;
}

export interface MediaAsset {
  _id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface PortfolioData {
  profile: {
    id: string;
    slug: string;
    displayName: string;
    isPublished: boolean;
    isDefault: boolean;
    updatedAt: string;
  };
  content: ProfileContent | null;
  settings: SiteSettings | null;
  skills: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
}

export interface DashboardReadiness {
  hasBasics: boolean;
  hasBio: boolean;
  hasProfileImage: boolean;
  hasResume: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
  hasProjects: boolean;
  hasEducation: boolean;
}

export interface DashboardStats {
  projects: number;
  experiences: number;
  skills: number;
  education?: number;
  certifications?: number;
  unreadMessages: number;
  /** @deprecated platform-wide count — omitted from readiness dashboard */
  totalProfiles?: number;
  lastUpdated: string;
  activity: { action: string; entity: string; timestamp: string }[];
  isPublished?: boolean;
  slug?: string;
  displayName?: string;
  readiness?: DashboardReadiness;
}
