import type { ComponentType, ReactNode } from 'react';
import type {
  ProfileContent,
  SiteSettings,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
} from '@/types';
import type { LayoutMode } from '@/lib/theme';

export type PortfolioThemeId =
  | 'glass'
  | 'spotlight'
  | 'terminal'
  | 'command-center'
  | 'bento'
  | 'studio'
  | 'olive';

export interface ShellProps {
  children: ReactNode;
}

export interface NavbarProps {
  name: string;
  slug: string;
  /** Override for draft preview (`/preview/:id`). Defaults to `/{slug}`. */
  basePath?: string;
  layoutMode: LayoutMode;
  sectionVisibility?: Record<string, boolean>;
  profileImageUrl?: string;
  resumeUrl?: string;
}

export interface HeroProps {
  content: ProfileContent;
  slug: string;
  basePath?: string;
}

export interface FooterProps {
  content: ProfileContent;
}

export interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export interface HighlightsSectionProps {
  stats: { label: string; value: string }[];
  tools: string[];
  showStats?: boolean;
  showAiStrip?: boolean;
}

export interface AboutSectionProps {
  content: ProfileContent;
  showExperienceBadge?: boolean;
}

export interface ContactSectionProps {
  content: ProfileContent;
  slug: string;
}

export interface ThemeSections {
  HighlightsSection: ComponentType<HighlightsSectionProps>;
  AboutSection: ComponentType<AboutSectionProps>;
  SkillsSection: ComponentType<{ skills: SkillCategory[] }>;
  ExperienceSection: ComponentType<{ experiences: Experience[] }>;
  ProjectsSection: ComponentType<{ projects: Project[] }>;
  EducationSection: ComponentType<{ education: Education[] }>;
  CertificationsSection: ComponentType<{ certifications: Certification[] }>;
  ContactSection: ComponentType<ContactSectionProps>;
}

export interface PortfolioThemeDefinition {
  id: PortfolioThemeId;
  name: string;
  description: string;
  preview: string;
  defaults: Partial<SiteSettings>;
  components: {
    Shell: ComponentType<ShellProps>;
    Navbar: ComponentType<NavbarProps>;
    Hero: ComponentType<HeroProps>;
    Footer: ComponentType<FooterProps>;
    SectionWrapper: ComponentType<SectionWrapperProps>;
  };
  sections: ThemeSections;
}
