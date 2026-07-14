import type { PortfolioThemeDefinition } from '../types';
import GlassShell from './GlassShell';
import GlassNavbar from './GlassNavbar';
import GlassHero from './GlassHero';
import GlassFooter from './GlassFooter';
import GlassSectionWrapper from './GlassSectionWrapper';
import {
  GlassHighlightsSection,
  GlassAboutSection,
  GlassSkillsSection,
  GlassExperienceSection,
  GlassProjectsSection,
  GlassEducationSection,
  GlassCertificationsSection,
  GlassContactSection,
} from './sections';

export const glassTheme: PortfolioThemeDefinition = {
  id: 'glass',
  name: 'Glassmorphism',
  description: 'Modern glass panels with gradient mesh backgrounds and soft glow effects.',
  preview: '/theme-previews/glass.svg',
  defaults: {
    portfolioTheme: 'glass',
    primaryColor: '#6366f1',
    secondaryColor: '#22d3ee',
    fontFamily: 'dm-sans',
    glassStyle: 'medium',
  },
  components: {
    Shell: GlassShell,
    Navbar: GlassNavbar,
    Hero: GlassHero,
    Footer: GlassFooter,
    SectionWrapper: GlassSectionWrapper,
  },
  sections: {
    HighlightsSection: GlassHighlightsSection,
    AboutSection: GlassAboutSection,
    SkillsSection: GlassSkillsSection,
    ExperienceSection: GlassExperienceSection,
    ProjectsSection: GlassProjectsSection,
    EducationSection: GlassEducationSection,
    CertificationsSection: GlassCertificationsSection,
    ContactSection: GlassContactSection,
  },
};
