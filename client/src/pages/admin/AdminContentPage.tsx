import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Eye, Download, FileText, Trash2, Upload, Sparkles, Undo2 } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminPortfolioPreviewPane } from '@/components/admin/AdminPortfolioPreviewPane';
import { UnsavedChangesBar } from '@/components/admin/UnsavedChangesBar';
import { useUnsavedForm } from '@/hooks/useUnsavedForm';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { GenerateWithAiButton } from '@/components/admin/GenerateWithAiButton';
import { MediaPickerField } from '@/components/admin/MediaPickerField';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  ResumeImportReviewModal,
  type ExtractedResumePreview,
  type ImportSectionFlags,
} from '@/components/admin/ResumeImportReviewModal';
import { useAuth } from '@/context/AuthContext';
import { FREE_IMPORT_USED_MESSAGE } from '@/lib/plans';
import { Link } from 'react-router-dom';
import type { ProfileContent } from '@/types';
import { cn } from '@/lib/utils';

const empty: ProfileContent = {
  name: '', title: '', tagline: '', location: '', phone: '', email: '',
  linkedin: '', portfolioUrl: '', github: '', bio: '', yearsExperience: '',
  educationHighlight: '', profileImageUrl: '', resumeUrl: '', stats: [], aiTools: [],
  workedWith: [], testimonials: [],
};

function SectionHeading({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold tracking-tight text-primary">{title}</h2>
      {hint ? <p className="mt-0.5 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

export default function AdminContentPage() {
  const { activeProfile, refreshProfiles } = useAdminProfile();
  const { user, refreshUser } = useAuth();
  const importLocked =
    user?.role === 'user' &&
    (user.plan === 'free' || !user.plan) &&
    !!user.resumeImportUsed;
  const [form, setForm] = useState<ProfileContent>(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [importingResume, setImportingResume] = useState(false);
  const [applyingImport, setApplyingImport] = useState(false);
  const [undoingImport, setUndoingImport] = useState(false);
  const [canUndoImport, setCanUndoImport] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [previewExtracted, setPreviewExtracted] = useState<ExtractedResumePreview | null>(null);
  const [previewResumeUrl, setPreviewResumeUrl] = useState('');
  const [previewSummary, setPreviewSummary] = useState<{
    displayName: string;
    skills: number;
    experiences: number;
    projects: number;
    education: number;
    certifications: number;
  } | null>(null);
  const [aiToolsStr, setAiToolsStr] = useState('');
  const [previewOpenMobile, setPreviewOpenMobile] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

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

  useEffect(() => {
    if (!activeProfile) {
      setCanUndoImport(false);
      return;
    }
    adminApi
      .getResumeImportUndoAvailable(activeProfile._id)
      .then((r) => setCanUndoImport(Boolean(r.available)))
      .catch(() => setCanUndoImport(false));
  }, [activeProfile]);

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
      setPreviewKey((k) => k + 1);
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
    if (importLocked) {
      toast.error(FREE_IMPORT_USED_MESSAGE);
      e.target.value = '';
      return;
    }
    setImportingResume(true);
    try {
      const result = await adminApi.importFromResume(activeProfile._id, file);
      setPreviewExtracted(result.extracted);
      setPreviewResumeUrl(result.resumeUrl);
      setPreviewSummary(result.summary);
      setReviewOpen(true);
    } catch (err) {
      toast.error(errorMessage(err, 'Resume import failed'));
    } finally {
      setImportingResume(false);
      e.target.value = '';
    }
  };

  const handleApplyImport = async (sections: ImportSectionFlags) => {
    if (!activeProfile || !previewExtracted) return;
    setApplyingImport(true);
    try {
      const result = await adminApi.applyResumeImport(activeProfile._id, {
        extracted: previewExtracted,
        resumeUrl: previewResumeUrl,
        sections,
      });
      const next = { ...empty, ...result.content };
      const tools = (result.content.aiTools || []).join(', ');
      setForm(next);
      setAiToolsStr(tools);
      commitBaseline({ form: next, aiToolsStr: tools });
      setPreviewKey((k) => k + 1);
      setCanUndoImport(true);
      setReviewOpen(false);
      setPreviewExtracted(null);
      setPreviewSummary(null);
      await refreshProfiles();
      await refreshUser();
      toast.success(
        `Applied import — ${result.summary.skills} skill groups, ${result.summary.experiences} roles, ${result.summary.projects} projects. Undo available if needed.`
      );
      if (result.resumeImportUsed) {
        toast.message('Free import used', {
          description: 'Resume import is now locked on Free. Upgrade for unlimited imports.',
        });
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not apply import'));
    } finally {
      setApplyingImport(false);
    }
  };

  const handleUndoImport = async () => {
    if (!activeProfile || !canUndoImport) return;
    if (!confirm('Restore your portfolio to how it was before the last resume import?')) return;
    setUndoingImport(true);
    try {
      const result = await adminApi.undoResumeImport(activeProfile._id);
      const next = { ...empty, ...(result.content || {}) };
      const tools = (result.content?.aiTools || []).join(', ');
      setForm(next);
      setAiToolsStr(tools);
      commitBaseline({ form: next, aiToolsStr: tools });
      setPreviewKey((k) => k + 1);
      setCanUndoImport(false);
      await refreshProfiles();
      toast.success('Import undone — previous content restored.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not undo import'));
    } finally {
      setUndoingImport(false);
    }
  };

  const workedCount = form.workedWith?.length ?? 0;
  const testimonialCount = form.testimonials?.length ?? 0;

  return (
    <RequireActiveProfile>
      <div className="mx-auto max-w-none space-y-4">
        <UnsavedChangesBar
          isDirty={isDirty}
          saving={saving}
          lastSavedAt={lastSavedAt}
          onSave={handleSave}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Profile & Hero</h1>
            <p className="mt-0.5 text-sm text-subtle">
              Edit above — preview updates after you save.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpenMobile((o) => !o)}
            >
              <Eye className="h-3.5 w-3.5" />
              {previewOpenMobile ? 'Hide preview' : 'Show preview'}
            </Button>
            <Button onClick={handleSave} disabled={saving || !isDirty} loading={saving}>
              {saving ? 'Saving…' : isDirty ? 'Save' : 'Saved'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="min-w-0 space-y-5">
            <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          {/* Identity rail — not sticky; avoids jump when right column expands */}
          <aside className="space-y-3 [overflow-anchor:none]">
            <Card className="flex flex-col gap-3 !p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066FF]/80">
                Identity
              </p>
              {form.profileImageUrl ? (
                <img
                  src={form.profileImageUrl}
                  alt={form.name || 'Profile'}
                  className="aspect-square w-full rounded-xl object-cover ring-1 ring-[#0066FF]/15"
                />
              ) : (
                <div className="grid aspect-square w-full place-items-center rounded-xl bg-muted text-sm text-subtle ring-1 ring-border">
                  No photo yet
                </div>
              )}
              <MediaPickerField
                label="Profile image"
                value={form.profileImageUrl}
                onChange={(url) => update('profileImageUrl', url)}
                compact
              />
              <label className="block w-full">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5" /> Upload new
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </Card>

            <Card className="flex flex-col gap-3 !p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066FF]/80">
                Resume
              </p>
              {form.resumeUrl ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent/10">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">Uploaded</p>
                    <p className="truncate text-[11px] text-subtle">Visible on your live site</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 px-2.5 py-3 text-center text-xs text-subtle">
                  No resume yet
                </div>
              )}
              {activeProfile && form.resumeUrl ? (
                <div className="grid grid-cols-3 gap-2">
                  <Tooltip content="View resume">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href={adminApi.getResumeUrl(activeProfile._id)} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </a>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Download resume">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href={adminApi.getResumeUrl(activeProfile._id, true)} download>
                        <Download className="h-3.5 w-3.5" />
                        Save
                      </a>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Remove resume">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/40 dark:text-red-400"
                      onClick={handleRemoveResume}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </Tooltip>
                </div>
              ) : null}
              <label className="block w-full">
                <Button size="sm" variant="outline" className="w-full" asChild disabled={uploadingResume}>
                  <span>
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingResume ? 'Uploading…' : form.resumeUrl ? 'Replace' : 'Upload PDF / DOCX'}
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
          </aside>

          {/* Form column */}
          <div className="min-w-0 space-y-3">
            <Card className="flex flex-col gap-2.5 border-accent/25 bg-accent/5 !p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="rounded-lg bg-accent/15 p-1.5">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">Import from resume</p>
                  <p className="text-xs text-subtle">
                    {importLocked
                      ? FREE_IMPORT_USED_MESSAGE
                      : 'Review AI extraction before replacing anything — Free includes 1 import.'}
                  </p>
                  {importLocked ? (
                    <Link to="/dashboard/pricing" className="mt-1 inline-block text-xs font-medium text-[#0066FF] hover:underline">
                      Upgrade for unlimited imports
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {canUndoImport ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={undoingImport}
                    onClick={handleUndoImport}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    {undoingImport ? 'Undoing…' : 'Undo import'}
                  </Button>
                ) : null}
                <label className="shrink-0">
                  <Button size="sm" disabled={importingResume || importLocked} asChild={!importLocked}>
                    {importLocked ? (
                      <span>
                        <Sparkles className="h-3.5 w-3.5" />
                        Import used
                      </span>
                    ) : (
                      <span>
                        <Sparkles className="h-3.5 w-3.5" />
                        {importingResume ? 'Reading…' : 'Import & review'}
                      </span>
                    )}
                  </Button>
                  {!importLocked ? (
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                      onChange={handleImportFromResume}
                      disabled={importingResume}
                    />
                  ) : null}
                </label>
              </div>
            </Card>

            <Card className="space-y-3 !p-4">
              <SectionHeading title="Basics" hint="Name and role shown in the hero." />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:[grid-template-columns:repeat(2,minmax(0,1fr))]">
                <FormField label="Name">
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
                </FormField>
                <FormField
                  label="Title"
                  action={
                    activeProfile ? (
                      <GenerateWithAiButton
                        profileId={activeProfile._id}
                        section="title"
                        context={{ name: form.name, title: form.title, yearsExperience: form.yearsExperience }}
                        onResult={(r) => update('title', r as string)}
                      />
                    ) : null
                  }
                >
                  <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
                </FormField>
                <FormField label="Location">
                  <Input value={form.location} onChange={(e) => update('location', e.target.value)} />
                </FormField>
                <FormField label="Years experience">
                  <Input
                    value={form.yearsExperience}
                    onChange={(e) => update('yearsExperience', e.target.value)}
                  />
                </FormField>
              </div>
            </Card>

            <Card className="space-y-3 !p-4">
              <SectionHeading title="Contact & links" hint="How people reach you." />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:[grid-template-columns:repeat(2,minmax(0,1fr))] xl:[grid-template-columns:repeat(4,minmax(0,1fr))]">
                <FormField label="Phone">
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </FormField>
                <FormField label="Email">
                  <Input value={form.email} onChange={(e) => update('email', e.target.value)} />
                </FormField>
                <FormField label="LinkedIn">
                  <Input value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} />
                </FormField>
                <FormField label="GitHub">
                  <Input value={form.github} onChange={(e) => update('github', e.target.value)} />
                </FormField>
              </div>
            </Card>

            <Card className="space-y-3 !p-4">
              <SectionHeading title="Story" hint="Tagline and bio for the hero and about sections." />
              <FormField
                label="Tagline"
                action={
                  activeProfile ? (
                    <GenerateWithAiButton
                      profileId={activeProfile._id}
                      section="tagline"
                      context={{
                        name: form.name,
                        title: form.title,
                        tagline: form.tagline,
                        yearsExperience: form.yearsExperience,
                      }}
                      onResult={(r) => update('tagline', r as string)}
                    />
                  ) : null
                }
              >
                <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
              </FormField>
              <div>
                <FormField
                  label="Bio"
                  action={
                    activeProfile ? (
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
                    ) : null
                  }
                >
                  <p className="-mt-1 mb-1.5 text-[11px] text-subtle">
                    Imported text stays as-is. Use AI to rewrite in first person.
                  </p>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    className="min-h-[100px]"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:[grid-template-columns:repeat(2,minmax(0,1fr))]">
                <FormField
                  label="Education highlight"
                  action={
                    activeProfile ? (
                      <GenerateWithAiButton
                        profileId={activeProfile._id}
                        section="educationHighlight"
                        context={{ educationHighlight: form.educationHighlight, name: form.name }}
                        onResult={(r) => update('educationHighlight', r as string)}
                      />
                    ) : null
                  }
                >
                  <Input
                    value={form.educationHighlight}
                    onChange={(e) => update('educationHighlight', e.target.value)}
                  />
                </FormField>
                <FormField label="AI tools (comma-separated)">
                  <Input value={aiToolsStr} onChange={(e) => setAiToolsStr(e.target.value)} />
                </FormField>
              </div>
            </Card>

            <details className="group rounded-xl border border-[#0066FF]/12 bg-elevated/60 open:bg-elevated/80 [overflow-anchor:none]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                <div>
                  <p className="text-sm font-semibold text-primary">Studio extras</p>
                  <p className="text-xs text-subtle">
                    Worked with & testimonials
                    {workedCount + testimonialCount > 0
                      ? ` · ${workedCount} companies, ${testimonialCount} quotes`
                      : ' · optional'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
              </summary>

              <div className="space-y-4 border-t border-[#0066FF]/10 px-4 py-4 sm:px-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-primary">Worked with</p>
                      <p className="text-xs text-subtle">Studio hero logos. Logo URL optional.</p>
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
                    <p className="text-xs text-subtle">No entries — experience companies are used as fallback.</p>
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

                <div className="space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-primary">Testimonials</p>
                      <p className="text-xs text-subtle">Enable in Personalization for Studio.</p>
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
                            {
                              quote: '',
                              clientName: '',
                              avatarUrl: '',
                              role: '',
                              order: (f.testimonials || []).length,
                            },
                          ],
                        }))
                      }
                    >
                      Add quote
                    </Button>
                  </div>
                  {(form.testimonials || []).length === 0 && (
                    <p className="text-xs text-subtle">No testimonials yet.</p>
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
                        className="min-h-[72px]"
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
              </div>
            </details>
          </div>
        </div>
          </div>

          {activeProfile ? (
            <div className={cn('w-full', previewOpenMobile ? 'block' : 'hidden')}>
              <AdminPortfolioPreviewPane
                profileId={activeProfile._id}
                refreshKey={previewKey}
                isDirty={isDirty}
                className="h-[min(75svh,42rem)]"
              />
            </div>
          ) : null}
        </div>
      </div>
      <ResumeImportReviewModal
        open={reviewOpen}
        onOpenChange={(next) => {
          if (!next && !applyingImport) {
            setReviewOpen(false);
            setPreviewExtracted(null);
            setPreviewSummary(null);
          } else {
            setReviewOpen(next);
          }
        }}
        extracted={previewExtracted}
        summary={previewSummary}
        applying={applyingImport}
        onApply={handleApplyImport}
      />
    </RequireActiveProfile>
  );
}
