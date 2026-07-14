import type { PortfolioThemeDefinition } from '../types';
import SpotlightShell from './SpotlightShell';
import SpotlightNavbar from './SpotlightNavbar';
import SpotlightHero from './SpotlightHero';
import SpotlightFooter from './SpotlightFooter';
import SpotlightSectionWrapper from './SpotlightSectionWrapper';
import {
  SpotlightHighlightsSection,
  SpotlightAboutSection,
  SpotlightSkillsSection,
  SpotlightExperienceSection,
  SpotlightProjectsSection,
  SpotlightEducationSection,
  SpotlightCertificationsSection,
  SpotlightContactSection,
} from './sections';

export const spotlightTheme: PortfolioThemeDefinition = {
  id: 'spotlight',
  name: 'Developer Spotlight',
  description: 'Bold layout with profile image, typewriter headline, orange accents, and card-based sections.',
  preview: '/theme-previews/spotlight.svg',
  defaults: {
    portfolioTheme: 'spotlight',
    primaryColor: '#f97316',
    secondaryColor: '#22c55e',
    fontFamily: 'space-grotesk',
    glassStyle: 'subtle',
  },
  components: {
    Shell: SpotlightShell,
    Navbar: SpotlightNavbar,
    Hero: SpotlightHero,
    Footer: SpotlightFooter,
    SectionWrapper: SpotlightSectionWrapper,
  },
  sections: {
    HighlightsSection: SpotlightHighlightsSection,
    AboutSection: SpotlightAboutSection,
    SkillsSection: SpotlightSkillsSection,
    ExperienceSection: SpotlightExperienceSection,
    ProjectsSection: SpotlightProjectsSection,
    EducationSection: SpotlightEducationSection,
    CertificationsSection: SpotlightCertificationsSection,
    ContactSection: SpotlightContactSection,
  },
};
