import { Plus, Trash2 } from 'lucide-react';
import type { GuestDraft } from '@/context/GuestDraftContext';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export const GUEST_DRAFT_SECTIONS = [
  { id: 'theme', label: 'Theme' },
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'certs', label: 'Certs' },
  { id: 'testimonials', label: 'Testimonials' },
] as const;

export type GuestDraftSectionId = (typeof GUEST_DRAFT_SECTIONS)[number]['id'];

type Props = {
  draft: GuestDraft;
  setDraft: (updater: GuestDraft | ((prev: GuestDraft) => GuestDraft)) => void;
  section: GuestDraftSectionId;
};

/** Shared section fields for /try sidebar and platform try-demo editor. */
export function GuestDraftEditorFields({ draft, setDraft, section }: Props) {
  const updateContent = (patch: Partial<GuestDraft['content']>) => {
    setDraft((d) => ({ ...d, content: { ...d.content, ...patch } }));
  };

  return (
    <>
      {section === 'theme' && (
        <div className="flex flex-wrap gap-1.5">
          {PORTFOLIO_THEME_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, themeId: t.id }))}
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                draft.themeId === t.id
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-secondary hover:bg-muted'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {section === 'profile' && (
        <div className="space-y-2.5">
          <FormField label="Profile image URL">
            <Input
              value={draft.content.profileImageUrl}
              onChange={(e) => updateContent({ profileImageUrl: e.target.value })}
              placeholder="https://…"
            />
          </FormField>
          {draft.content.profileImageUrl && (
            <img
              src={draft.content.profileImageUrl}
              alt=""
              className="h-14 w-14 rounded-full border border-border object-cover"
            />
          )}
          <FormField label="Name">
            <Input
              value={draft.content.name}
              onChange={(e) => updateContent({ name: e.target.value })}
            />
          </FormField>
          <FormField label="Title">
            <Input
              value={draft.content.title}
              onChange={(e) => updateContent({ title: e.target.value })}
            />
          </FormField>
          <FormField label="Location">
            <Input
              value={draft.content.location}
              onChange={(e) => updateContent({ location: e.target.value })}
            />
          </FormField>
          <FormField label="Years experience">
            <Input
              value={draft.content.yearsExperience}
              onChange={(e) => updateContent({ yearsExperience: e.target.value })}
            />
          </FormField>
          <FormField label="Email">
            <Input
              value={draft.content.email}
              onChange={(e) => updateContent({ email: e.target.value })}
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={draft.content.phone}
              onChange={(e) => updateContent({ phone: e.target.value })}
            />
          </FormField>
          <FormField label="GitHub">
            <Input
              value={draft.content.github}
              onChange={(e) => updateContent({ github: e.target.value })}
            />
          </FormField>
          <FormField label="LinkedIn">
            <Input
              value={draft.content.linkedin}
              onChange={(e) => updateContent({ linkedin: e.target.value })}
            />
          </FormField>
          <FormField label="Tagline">
            <Input
              value={draft.content.tagline}
              onChange={(e) => updateContent({ tagline: e.target.value })}
            />
          </FormField>
          <FormField label="Bio">
            <Textarea
              rows={3}
              value={draft.content.bio}
              onChange={(e) => updateContent({ bio: e.target.value })}
            />
          </FormField>
        </div>
      )}

      {section === 'skills' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-xs"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  skills: [...d.skills, { name: 'New category', skillsText: '' }],
                }))
              }
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {draft.skills.map((skill, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2.5">
              <div className="flex gap-2">
                <Input
                  value={skill.name}
                  onChange={(e) =>
                    setDraft((d) => {
                      const skills = [...d.skills];
                      skills[i] = { ...skills[i], name: e.target.value };
                      return { ...d, skills };
                    })
                  }
                  placeholder="Category"
                />
                <Button
                  size="sm"
                  variant="danger"
                  type="button"
                  className="h-9 shrink-0"
                  disabled={draft.skills.length <= 1}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      skills: d.skills.filter((_, j) => j !== i),
                    }))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                value={skill.skillsText}
                onChange={(e) =>
                  setDraft((d) => {
                    const skills = [...d.skills];
                    skills[i] = { ...skills[i], skillsText: e.target.value };
                    return { ...d, skills };
                  })
                }
                placeholder="Comma-separated skills"
              />
            </div>
          ))}
        </div>
      )}

      {section === 'experience' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-xs"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  experiences: [
                    ...d.experiences,
                    {
                      role: '',
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      isCurrent: false,
                      bulletsText: '',
                    },
                  ],
                }))
              }
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {draft.experiences.map((exp, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2.5">
              <Input
                placeholder="Role"
                value={exp.role}
                onChange={(e) =>
                  setDraft((d) => {
                    const experiences = [...d.experiences];
                    experiences[i] = { ...experiences[i], role: e.target.value };
                    return { ...d, experiences };
                  })
                }
              />
              <Input
                placeholder="Company"
                value={exp.company}
                onChange={(e) =>
                  setDraft((d) => {
                    const experiences = [...d.experiences];
                    experiences[i] = { ...experiences[i], company: e.target.value };
                    return { ...d, experiences };
                  })
                }
              />
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  placeholder="Start"
                  value={exp.startDate}
                  onChange={(e) =>
                    setDraft((d) => {
                      const experiences = [...d.experiences];
                      experiences[i] = { ...experiences[i], startDate: e.target.value };
                      return { ...d, experiences };
                    })
                  }
                />
                <Input
                  placeholder="End"
                  value={exp.endDate}
                  disabled={exp.isCurrent}
                  onChange={(e) =>
                    setDraft((d) => {
                      const experiences = [...d.experiences];
                      experiences[i] = { ...experiences[i], endDate: e.target.value };
                      return { ...d, experiences };
                    })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-subtle">
                <input
                  type="checkbox"
                  checked={exp.isCurrent}
                  onChange={(e) =>
                    setDraft((d) => {
                      const experiences = [...d.experiences];
                      experiences[i] = {
                        ...experiences[i],
                        isCurrent: e.target.checked,
                      };
                      return { ...d, experiences };
                    })
                  }
                />
                Current role
              </label>
              <Textarea
                rows={2}
                placeholder="Bullets (one per line)"
                value={exp.bulletsText}
                onChange={(e) =>
                  setDraft((d) => {
                    const experiences = [...d.experiences];
                    experiences[i] = { ...experiences[i], bulletsText: e.target.value };
                    return { ...d, experiences };
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {section === 'projects' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-xs"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  projects: [
                    ...d.projects,
                    {
                      title: '',
                      description: '',
                      techStackText: '',
                      imageUrl: '',
                      liveUrl: '',
                      githubUrl: '',
                    },
                  ],
                }))
              }
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {draft.projects.map((proj, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2.5">
              <Input
                placeholder="Title"
                value={proj.title}
                onChange={(e) =>
                  setDraft((d) => {
                    const projects = [...d.projects];
                    projects[i] = { ...projects[i], title: e.target.value };
                    return { ...d, projects };
                  })
                }
              />
              <Textarea
                rows={2}
                placeholder="Description"
                value={proj.description}
                onChange={(e) =>
                  setDraft((d) => {
                    const projects = [...d.projects];
                    projects[i] = { ...projects[i], description: e.target.value };
                    return { ...d, projects };
                  })
                }
              />
              <Input
                placeholder="Image URL"
                value={proj.imageUrl}
                onChange={(e) =>
                  setDraft((d) => {
                    const projects = [...d.projects];
                    projects[i] = { ...projects[i], imageUrl: e.target.value };
                    return { ...d, projects };
                  })
                }
              />
              <Input
                placeholder="Tech (comma-separated)"
                value={proj.techStackText}
                onChange={(e) =>
                  setDraft((d) => {
                    const projects = [...d.projects];
                    projects[i] = { ...projects[i], techStackText: e.target.value };
                    return { ...d, projects };
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {section === 'education' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-xs"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  education: [
                    ...d.education,
                    { degree: '', institution: '', years: '', cgpa: '' },
                  ],
                }))
              }
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {draft.education.map((edu, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2.5">
              <Input
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) =>
                  setDraft((d) => {
                    const education = [...d.education];
                    education[i] = { ...education[i], degree: e.target.value };
                    return { ...d, education };
                  })
                }
              />
              <Input
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) =>
                  setDraft((d) => {
                    const education = [...d.education];
                    education[i] = { ...education[i], institution: e.target.value };
                    return { ...d, education };
                  })
                }
              />
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  placeholder="Years"
                  value={edu.years}
                  onChange={(e) =>
                    setDraft((d) => {
                      const education = [...d.education];
                      education[i] = { ...education[i], years: e.target.value };
                      return { ...d, education };
                    })
                  }
                />
                <Input
                  placeholder="CGPA"
                  value={edu.cgpa}
                  onChange={(e) =>
                    setDraft((d) => {
                      const education = [...d.education];
                      education[i] = { ...education[i], cgpa: e.target.value };
                      return { ...d, education };
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {section === 'certs' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-xs"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  certifications: [...d.certifications, { name: '', issuer: '', year: '' }],
                }))
              }
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {draft.certifications.map((cert, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2.5">
              <Input
                placeholder="Certificate"
                value={cert.name}
                onChange={(e) =>
                  setDraft((d) => {
                    const certifications = [...d.certifications];
                    certifications[i] = { ...certifications[i], name: e.target.value };
                    return { ...d, certifications };
                  })
                }
              />
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  placeholder="Issuer"
                  value={cert.issuer}
                  onChange={(e) =>
                    setDraft((d) => {
                      const certifications = [...d.certifications];
                      certifications[i] = { ...certifications[i], issuer: e.target.value };
                      return { ...d, certifications };
                    })
                  }
                />
                <Input
                  placeholder="Year"
                  value={cert.year}
                  onChange={(e) =>
                    setDraft((d) => {
                      const certifications = [...d.certifications];
                      certifications[i] = { ...certifications[i], year: e.target.value };
                      return { ...d, certifications };
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {section === 'testimonials' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-xs"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  testimonials: [
                    ...d.testimonials,
                    { quote: '', clientName: '', role: '', avatarUrl: '' },
                  ],
                }))
              }
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {draft.testimonials.map((t, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2.5">
              <Textarea
                rows={3}
                placeholder="Quote"
                value={t.quote}
                onChange={(e) =>
                  setDraft((d) => {
                    const testimonials = [...d.testimonials];
                    testimonials[i] = { ...testimonials[i], quote: e.target.value };
                    return { ...d, testimonials };
                  })
                }
              />
              <Input
                placeholder="Client name"
                value={t.clientName}
                onChange={(e) =>
                  setDraft((d) => {
                    const testimonials = [...d.testimonials];
                    testimonials[i] = { ...testimonials[i], clientName: e.target.value };
                    return { ...d, testimonials };
                  })
                }
              />
              <Input
                placeholder="Role / company"
                value={t.role}
                onChange={(e) =>
                  setDraft((d) => {
                    const testimonials = [...d.testimonials];
                    testimonials[i] = { ...testimonials[i], role: e.target.value };
                    return { ...d, testimonials };
                  })
                }
              />
              <Input
                placeholder="Avatar URL"
                value={t.avatarUrl}
                onChange={(e) =>
                  setDraft((d) => {
                    const testimonials = [...d.testimonials];
                    testimonials[i] = { ...testimonials[i], avatarUrl: e.target.value };
                    return { ...d, testimonials };
                  })
                }
              />
              <Button
                size="sm"
                variant="danger"
                type="button"
                className="h-7 text-xs"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    testimonials: d.testimonials.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 className="h-3 w-3" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
