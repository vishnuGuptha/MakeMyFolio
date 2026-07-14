import type { ReactNode } from 'react';
import type { PortfolioData } from '@/types';
import { usePortfolioTheme } from '@/context/PortfolioThemeContext';
import ThemeSectionWrapper from '@/themes/ThemeSectionWrapper';
import type { NavSectionId } from '@/lib/theme';

function SectionBlock({ children }: { children: ReactNode }) {
  return <ThemeSectionWrapper>{children}</ThemeSectionWrapper>;
}

export function PortfolioSectionContent({
  section,
  data,
}: {
  section: NavSectionId | 'all';
  data: PortfolioData;
}) {
  const { sections } = usePortfolioTheme();
  const {
    HighlightsSection,
    AboutSection,
    SkillsSection,
    ExperienceSection,
    ProjectsSection,
    EducationSection,
    CertificationsSection,
    ContactSection,
  } = sections;

  const { content, settings, skills, experiences, projects, education, certifications, profile } = data;
  if (!content) return null;

  if (section === 'all') {
    return (
      <SectionBlock>
        <HighlightsSection
          stats={content.stats}
          tools={content.aiTools}
          showStats={settings?.showStats}
          showAiStrip={settings?.showAiStrip}
        />
        <AboutSection content={content} showExperienceBadge={!settings?.showStats} />
        <SkillsSection skills={skills} />
        <ExperienceSection experiences={experiences} />
        <ProjectsSection projects={projects} />
        <EducationSection education={education} />
        <CertificationsSection certifications={certifications} />
        <ContactSection content={content} slug={profile.slug} />
      </SectionBlock>
    );
  }

  switch (section) {
    case 'about':
      return (
        <SectionBlock>
          <HighlightsSection
            stats={content.stats}
            tools={content.aiTools}
            showStats={settings?.showStats}
            showAiStrip={settings?.showAiStrip}
          />
          <AboutSection content={content} showExperienceBadge={!settings?.showStats} />
        </SectionBlock>
      );
    case 'skills':
      return <SectionBlock><SkillsSection skills={skills} /></SectionBlock>;
    case 'experience':
      return <SectionBlock><ExperienceSection experiences={experiences} /></SectionBlock>;
    case 'projects':
      return <SectionBlock><ProjectsSection projects={projects} /></SectionBlock>;
    case 'education':
      return <SectionBlock><EducationSection education={education} /></SectionBlock>;
    case 'certifications':
      return <SectionBlock><CertificationsSection certifications={certifications} /></SectionBlock>;
    case 'contact':
      return <SectionBlock><ContactSection content={content} slug={profile.slug} /></SectionBlock>;
    default:
      return null;
  }
}
