import type { PortfolioThemeDefinition } from '../types';
import CommandCenterShell from './CommandCenterShell';
import CommandCenterNavbar from './CommandCenterNavbar';
import CommandCenterHero from './CommandCenterHero';
import CommandCenterFooter from './CommandCenterFooter';
import CommandCenterSectionWrapper from './CommandCenterSectionWrapper';
import {
  CommandCenterHighlightsSection,
  CommandCenterAboutSection,
  CommandCenterSkillsSection,
  CommandCenterExperienceSection,
  CommandCenterProjectsSection,
  CommandCenterEducationSection,
  CommandCenterCertificationsSection,
  CommandCenterContactSection,
} from './sections';

export const commandCenterTheme: PortfolioThemeDefinition = {
  id: 'command-center',
  name: 'AI Command Center',
  description: 'Premium futuristic dashboard with glass panels, soft glows, and mission-control aesthetics.',
  preview: '/theme-previews/command-center.svg',
  defaults: {
    portfolioTheme: 'command-center',
    primaryColor: '#3B82F6',
    secondaryColor: '#22D3EE',
    fontFamily: 'inter',
    glassStyle: 'subtle',
    cursorEffect: 'glow',
  },
  components: {
    Shell: CommandCenterShell,
    Navbar: CommandCenterNavbar,
    Hero: CommandCenterHero,
    Footer: CommandCenterFooter,
    SectionWrapper: CommandCenterSectionWrapper,
  },
  sections: {
    HighlightsSection: CommandCenterHighlightsSection,
    AboutSection: CommandCenterAboutSection,
    SkillsSection: CommandCenterSkillsSection,
    ExperienceSection: CommandCenterExperienceSection,
    ProjectsSection: CommandCenterProjectsSection,
    EducationSection: CommandCenterEducationSection,
    CertificationsSection: CommandCenterCertificationsSection,
    ContactSection: CommandCenterContactSection,
  },
};
