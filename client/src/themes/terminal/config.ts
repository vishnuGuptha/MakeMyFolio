import type { PortfolioThemeDefinition } from '../types';
import TerminalShell from './TerminalShell';
import TerminalNavbar from './TerminalNavbar';
import TerminalHero from './TerminalHero';
import TerminalFooter from './TerminalFooter';
import TerminalSectionWrapper from './TerminalSectionWrapper';
import {
  TerminalHighlightsSection,
  TerminalAboutSection,
  TerminalSkillsSection,
  TerminalExperienceSection,
  TerminalProjectsSection,
  TerminalEducationSection,
  TerminalCertificationsSection,
  TerminalContactSection,
} from './sections';

export const terminalTheme: PortfolioThemeDefinition = {
  id: 'terminal',
  name: 'Terminal CLI',
  description: 'Hacker-style CLI layout with monospace commands, window chrome, and green/amber accents.',
  preview: '/theme-previews/terminal.svg',
  defaults: {
    portfolioTheme: 'terminal',
    primaryColor: '#4ade80',
    secondaryColor: '#fbbf24',
    fontFamily: 'jetbrains-mono',
    glassStyle: 'subtle',
  },
  components: {
    Shell: TerminalShell,
    Navbar: TerminalNavbar,
    Hero: TerminalHero,
    Footer: TerminalFooter,
    SectionWrapper: TerminalSectionWrapper,
  },
  sections: {
    HighlightsSection: TerminalHighlightsSection,
    AboutSection: TerminalAboutSection,
    SkillsSection: TerminalSkillsSection,
    ExperienceSection: TerminalExperienceSection,
    ProjectsSection: TerminalProjectsSection,
    EducationSection: TerminalEducationSection,
    CertificationsSection: TerminalCertificationsSection,
    ContactSection: TerminalContactSection,
  },
};
