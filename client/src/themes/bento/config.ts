import type { PortfolioThemeDefinition } from '../types';
import BentoShell from './BentoShell';
import BentoNavbar from './BentoNavbar';
import BentoHero from './BentoHero';
import BentoFooter from './BentoFooter';
import BentoSectionWrapper from './BentoSectionWrapper';
import {
  BentoHighlightsSection,
  BentoAboutSection,
  BentoSkillsSection,
  BentoExperienceSection,
  BentoProjectsSection,
  BentoEducationSection,
  BentoCertificationsSection,
  BentoContactSection,
} from './sections';

export const bentoTheme: PortfolioThemeDefinition = {
  id: 'bento',
  name: 'Soft Bento',
  description:
    'Soft pillow-card board with cool neutrals, image-forward layout, and project webviews.',
  preview: '/theme-previews/bento.svg',
  defaults: {
    portfolioTheme: 'bento',
    primaryColor: '#14B8A6',
    secondaryColor: '#CCFBF1',
    fontFamily: 'space-grotesk',
    glassStyle: 'subtle',
    cursorEffect: 'none',
    projectPreviewMode: 'webview',
    projectWebviewSlowScroll: false,
  },
  components: {
    Shell: BentoShell,
    Navbar: BentoNavbar,
    Hero: BentoHero,
    Footer: BentoFooter,
    SectionWrapper: BentoSectionWrapper,
  },
  sections: {
    HighlightsSection: BentoHighlightsSection,
    AboutSection: BentoAboutSection,
    SkillsSection: BentoSkillsSection,
    ExperienceSection: BentoExperienceSection,
    ProjectsSection: BentoProjectsSection,
    EducationSection: BentoEducationSection,
    CertificationsSection: BentoCertificationsSection,
    ContactSection: BentoContactSection,
  },
};
