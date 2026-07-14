import type { PortfolioThemeDefinition } from '../types';
import OliveShell from './OliveShell';
import OliveNavbar from './OliveNavbar';
import OliveHero from './OliveHero';
import OliveFooter from './OliveFooter';
import OliveSectionWrapper from './OliveSectionWrapper';
import {
  OliveHighlightsSection,
  OliveAboutSection,
  OliveSkillsSection,
  OliveExperienceSection,
  OliveProjectsSection,
  OliveEducationSection,
  OliveCertificationsSection,
  OliveContactSection,
} from './sections';

export const oliveTheme: PortfolioThemeDefinition = {
  id: 'olive',
  name: 'Olive Career',
  description:
    'Dark charcoal career portfolio with moss-green accent, circular hero, skill tiles, and pipe section headers.',
  preview: '/theme-previews/olive.svg',
  defaults: {
    portfolioTheme: 'olive',
    primaryColor: '#5E8C50',
    secondaryColor: '#98A1A8',
    fontFamily: 'poppins',
    glassStyle: 'subtle',
    cursorEffect: 'none',
    projectPreviewMode: 'image',
    projectWebviewSlowScroll: false,
    showStats: true,
    showTestimonials: true,
  },
  components: {
    Shell: OliveShell,
    Navbar: OliveNavbar,
    Hero: OliveHero,
    Footer: OliveFooter,
    SectionWrapper: OliveSectionWrapper,
  },
  sections: {
    HighlightsSection: OliveHighlightsSection,
    AboutSection: OliveAboutSection,
    SkillsSection: OliveSkillsSection,
    ExperienceSection: OliveExperienceSection,
    ProjectsSection: OliveProjectsSection,
    EducationSection: OliveEducationSection,
    CertificationsSection: OliveCertificationsSection,
    ContactSection: OliveContactSection,
  },
};
