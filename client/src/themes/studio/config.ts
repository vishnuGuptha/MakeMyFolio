import type { PortfolioThemeDefinition } from '../types';
import StudioShell from './StudioShell';
import StudioNavbar from './StudioNavbar';
import StudioHero from './StudioHero';
import StudioFooter from './StudioFooter';
import StudioSectionWrapper from './StudioSectionWrapper';
import {
  StudioHighlightsSection,
  StudioAboutSection,
  StudioSkillsSection,
  StudioExperienceSection,
  StudioProjectsSection,
  StudioEducationSection,
  StudioCertificationsSection,
  StudioContactSection,
} from './sections';

export const studioTheme: PortfolioThemeDefinition = {
  id: 'studio',
  name: 'Studio Portfolio',
  description:
    'Figma Personal Portfolio template — mono + sans, glow CTAs, case studies, testimonials — dark-only.',
  preview: '/theme-previews/studio.svg',
  defaults: {
    portfolioTheme: 'studio',
    primaryColor: '#68AD0F',
    secondaryColor: '#2F4F4F',
    fontFamily: 'space-grotesk',
    glassStyle: 'subtle',
    cursorEffect: 'none',
    projectPreviewMode: 'webview',
    showTestimonials: true,
  },
  components: {
    Shell: StudioShell,
    Navbar: StudioNavbar,
    Hero: StudioHero,
    Footer: StudioFooter,
    SectionWrapper: StudioSectionWrapper,
  },
  sections: {
    HighlightsSection: StudioHighlightsSection,
    AboutSection: StudioAboutSection,
    SkillsSection: StudioSkillsSection,
    ExperienceSection: StudioExperienceSection,
    ProjectsSection: StudioProjectsSection,
    EducationSection: StudioEducationSection,
    CertificationsSection: StudioCertificationsSection,
    ContactSection: StudioContactSection,
  },
};
