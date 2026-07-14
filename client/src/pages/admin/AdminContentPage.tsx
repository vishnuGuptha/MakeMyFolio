import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Eye, Download, FileText, Trash2, Upload, Sparkles } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { UnsavedChangesBar } from '@/components/admin/UnsavedChangesBar';
import { useUnsavedForm } from '@/hooks/useUnsavedForm';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { GenerateWithAiButton, AiFieldLabel } from '@/components/admin/GenerateWithAiButton';
import { MediaPickerField } from '@/components/admin/MediaPickerField';
import type { ProfileContent } from '@/types';

const empty: ProfileContent = {
  name: '', title: '', tagline: '', location: '', phone: '', email: '',
  linkedin: '', portfolioUrl: '', github: '', bio: '', yearsExperience: '',
  educationHighlight: '', profileImageUrl: '', resumeUrl: '', stats: [], aiTools: [],
  workedWith: [], testimonials: [],
};

export default function AdminContentPage() {
  const { activeProfile, refreshProfiles } = useAdminProfile();
  const [form, setForm] = useState<ProfileContent>(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [importingResume, setImportingResume] = useState(false);
  const [aiToolsStr, setAiToolsStr] = useState('');

  const draft = useMemo(() => ({ form, aiToolsStr }), [form, aiToolsStr]);
  const { isDirty, lastSavedAt, commitBaseline } = useUnsavedForm(draft);

  useEffect(() => {
    if (!activeProfile) return;
    adminApi
      .getContent(activeProfile._id)
      .then((data) => {
        const next = data ? { ...empty, ...data } : empty;
        const tools = (data?.aiTools || []).join(', ');
        setForm(next);
        setAiToolsStr(tools);
        commitBaseline({ form: next, aiToolsStr: tools });
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load profile')));
  }, [activeProfile, commitBaseline]);

  const update = (key: keyof ProfileContent, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    if (!activeProfile) return;
    setSaving(true);
    try {
      const aiTools = aiToolsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await adminApi.updateContent(activeProfile._id, {
        ...form,
        aiTools,
      });
      commitBaseline({ form: { ...form, aiTools }, aiToolsStr });
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    try {
      const asset = await adminApi.uploadMedia(activeProfile._id, file);
      update('profileImageUrl', asset.url);
      toast.success('Profile image uploaded!');
    } catch {
      toast.error('Upload failed');
    }
    e.target.value = '';
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    setUploadingResume(true);
    try {
      const { resumeUrl } = await adminApi.uploadResume(activeProfile._id, file);
      update('resumeUrl', resumeUrl);
      toast.success('Resume uploaded!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resume upload failed');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleRemoveResume = async () => {
    if (!activeProfile || !form.resumeUrl) return;
    if (!confirm('Remove resume from your portfolio?')) return;
    try {
      await adminApi.deleteResume(activeProfile._id);
      update('resumeUrl', '');
      toast.success('Resume removed');
    } catch {
      toast.error('Failed to remove resume');
    }
  };

  const handleImportFromResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    if (
      !confirm(
        'This will use Gemini AI to extract data from your resume and replace your current profile, skills, experience, projects, education, and certifications. Continue?'
      )
    ) {
      e.target.value = '';
      return;
    }
    setImportingResume(true);
    try {
      const result = await adminApi.importFromResume(activeProfile._id, file);
      const next = { ...empty, ...result.content };
      const tools = (result.content.aiTools || []).join(', ');
      setForm(next);
      setAiToolsStr(tools);
      commitBaseline({ form: next, aiToolsStr: tools });
      await refreshProfiles();
      toast.success(
        `Portfolio filled with exact resume text! ${result.summary.skills} skill categories, ${result.summary.experiences} experiences, ${result.summary.projects} projects. Use Generate with AI on any field to improve.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resume import failed');
    } finally {
      setImportingResume(false);
      e.target.value = '';
    }
  };

  return (
    <RequireActiveProfile>
      <div className="space-y-6 max-w-3xl">
        <UnsavedChangesBar
          isDirty={isDirty}
          saving={saving}
          lastSavedAt={lastSavedAt}
          onSave={handleSave}
        />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Profile & Hero</h1>
          <Button onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
          </Button>
        </div>

        <Card className="p-5 border-accent/30 bg-accent/5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-accent/15 p-2">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-primary">Import from Resume</h2>
              <p className="text-sm text-subtle mt-1">
                Upload PDF or DOCX to fill all fields with <strong className="text-secondary">exact wording</strong> from your document (no AI rewriting). After import, use <strong className="text-secondary">Generate with AI</strong> on individual fields to improve any section.
              </p>
              <label className="inline-block mt-3">
                <Button size="sm" disabled={importingResume} asChild>
                  <span>
                    <Sparkles className="h-3.5 w-3.5" />
                    {importingResume ? 'Extracting text & parsing with Gemini...' : 'Import & Auto-fill from Resume'}
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                  onChange={handleImportFromResume}
                  disabled={importingResume}
                />
              </label>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Name"><Input value={form.name} onChange={(e) => update('name', e.target.value)} /></FormField>
            <div>
              <AiFieldLabel label="Title">
                {activeProfile && (
                  <GenerateWithAiButton
                    profileId={activeProfile._id}
                    section="title"
                    context={{ name: form.name, title: form.title, yearsExperience: form.yearsExperience }}
                    onResult={(r) => update('title', r as string)}
                  />
                )}
              </AiFieldLabel>
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <FormField label="Location"><Input value={form.location} onChange={(e) => update('location', e.target.value)} /></FormField>
            <FormField label="Years Experience"><Input value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)} /></FormField>
            <FormField label="Phone"><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></FormField>
            <FormField label="Email"><Input value={form.email} onChange={(e) => update('email', e.target.value)} /></FormField>
            <FormField label="LinkedIn"><Input value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} /></FormField>
            <FormField label="GitHub"><Input value={form.github} onChange={(e) => update('github', e.target.value)} /></FormField>
          </div>
          <div>
            <AiFieldLabel label="Tagline">
              {activeProfile && (
                <GenerateWithAiButton
                  profileId={activeProfile._id}
                  section="tagline"
                  context={{ name: form.name, title: form.title, tagline: form.tagline, yearsExperience: form.yearsExperience }}
                  onResult={(r) => update('tagline', r as string)}
                />
              )}
            </AiFieldLabel>
            <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
          </div>
          <div>
            <AiFieldLabel label="Bio">
              {activeProfile && (
                <GenerateWithAiButton
                  profileId={activeProfile._id}
                  section="bio"
                  context={{
                    name: form.name,
                    title: form.title,
                    bio: form.bio,
                    yearsExperience: form.yearsExperience,
                    educationHighlight: form.educationHighlight,
                    aiTools: aiToolsStr,
                  }}
                  onResult={(r) => update('bio', r as string)}
                />
              )}
            </AiFieldLabel>
            <p className="text-xs text-subtle mb-2">Imported text stays as-is from your resume. Click Generate with AI above to rewrite in first person for HR.</p>
            <Textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} className="min-h-[150px]" />
          </div>
          <div>
            <AiFieldLabel label="Education Highlight">
              {activeProfile && (
                <GenerateWithAiButton
                  profileId={activeProfile._id}
                  section="educationHighlight"
                  context={{ educationHighlight: form.educationHighlight, name: form.name }}
                  onResult={(r) => update('educationHighlight', r as string)}
                />
              )}
            </AiFieldLabel>
            <Input value={form.educationHighlight} onChange={(e) => update('educationHighlight', e.target.value)} />
          </div>
          <FormField label="AI Tools (comma-separated)"><Input value={aiToolsStr} onChange={(e) => setAiToolsStr(e.target.value)} /></FormField>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-primary">Worked with</p>
                <p className="text-xs text-subtle">Shown on Studio Portfolio hero. Logo URL optional.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    workedWith: [...(f.workedWith || []), { name: '', logoUrl: '' }],
                  }))
                }
              >
                Add company
              </Button>
            </div>
            {(form.workedWith || []).length === 0 && (
              <p className="text-xs text-subtle font-mono">No entries — experience companies are used as fallback.</p>
            )}
            {(form.workedWith || []).map((row, idx) => (
              <div key={idx} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="Company name"
                  value={row.name}
                  onChange={(e) =>
                    setForm((f) => {
                      const next = [...(f.workedWith || [])];
                      next[idx] = { ...next[idx], name: e.target.value };
                      return { ...f, workedWith: next };
                    })
                  }
                />
                <Input
                  placeholder="Logo URL (optional)"
                  value={row.logoUrl || ''}
                  onChange={(e) =>
                    setForm((f) => {
                      const next = [...(f.workedWith || [])];
                      next[idx] = { ...next[idx], logoUrl: e.target.value };
                      return { ...f, workedWith: next };
                    })
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      workedWith: (f.workedWith || []).filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-primary">Testimonials</p>
                <p className="text-xs text-subtle">Used by Studio Portfolio. Enable Show Testimonials in Personalization.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    testimonials: [
                      ...(f.testimonials || []),
                      { quote: '', clientName: '', avatarUrl: '', role: '', order: (f.testimonials || []).length },
                    ],
                  }))
                }
              >
                Add quote
              </Button>
            </div>
            {(form.testimonials || []).length === 0 && (
              <p className="text-xs text-subtle font-mono">No testimonials yet.</p>
            )}
            {(form.testimonials || []).map((row, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-border/70 p-3">
                <Textarea
                  placeholder="Quote"
                  value={row.quote}
                  onChange={(e) =>
                    setForm((f) => {
                      const next = [...(f.testimonials || [])];
                      next[idx] = { ...next[idx], quote: e.target.value };
                      return { ...f, testimonials: next };
                    })
                  }
                  className="min-h-[80px]"
                />
                <div className="grid gap-2 md:grid-cols-3">
                  <Input
                    placeholder="Client name"
                    value={row.clientName}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.testimonials || [])];
                        next[idx] = { ...next[idx], clientName: e.target.value };
                        return { ...f, testimonials: next };
                      })
                    }
                  />
                  <Input
                    placeholder="Role (optional)"
                    value={row.role || ''}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.testimonials || [])];
                        next[idx] = { ...next[idx], role: e.target.value };
                        return { ...f, testimonials: next };
                      })
                    }
                  />
                  <Input
                    placeholder="Avatar URL"
                    value={row.avatarUrl || ''}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.testimonials || [])];
                        next[idx] = { ...next[idx], avatarUrl: e.target.value };
                        return { ...f, testimonials: next };
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      testimonials: (f.testimonials || []).filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <MediaPickerField
                label="Profile image"
                value={form.profileImageUrl}
                onChange={(url) => update('profileImageUrl', url)}
              />
              <label className="inline-flex">
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5" /> Upload new
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <FormField label="Resume (PDF / DOCX)">
              <Card className="p-4 space-y-3 bg-muted/30">
                {form.resumeUrl ? (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-accent/10 p-2">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary">Resume uploaded</p>
                      <p className="text-xs text-subtle mt-0.5">PDF or DOCX · visible on your live portfolio</p>
                      {activeProfile && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <a href={adminApi.getResumeUrl(activeProfile._id)} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3.5 w-3.5" /> View
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={adminApi.getResumeUrl(activeProfile._id, true)} download>
                              <Download className="h-3.5 w-3.5" /> Download
                            </a>
                          </Button>
                          <Button size="sm" variant="danger" onClick={handleRemoveResume}>
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-subtle">No resume uploaded yet.</p>
                )}
                <label className="block">
                  <Button size="sm" variant="outline" asChild disabled={uploadingResume}>
                    <span>
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingResume ? 'Uploading...' : form.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                    </span>
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                  />
                </label>
              </Card>
            </FormField>
          </div>
        </Card>
      </div>
    </RequireActiveProfile>
  );
}
