import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Circle, Tag, BarChart3, LayoutGrid } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminEmptyState, AdminListSkeleton } from '@/components/admin/AdminEmptyState';
import {
  reorderItemIds,
  SortableDragHandle,
  SortableItem,
  SortableList,
} from '@/components/admin/ReorderButtons';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  SKILLS_DISPLAY_STYLE_OPTIONS,
  defaultSkillsDisplayStyleForTheme,
  resolveSkillsDisplayStyle,
} from '@/themes/shared/skills';
import type { SkillCategory, SkillItem, SkillsDisplayStyle, SiteSettings } from '@/types';
import { cn } from '@/lib/utils';

const STYLE_ICONS: Record<SkillsDisplayStyle, typeof Tag> = {
  chips: Tag,
  rings: Circle,
  bars: BarChart3,
  cards: LayoutGrid,
};

/** Parse "Name", "Name:Advanced", or "Name:80" — preserve prior levels by name when omitted. */
export function parseSkillsInput(raw: string, previous: SkillItem[]): SkillItem[] {
  const prevByName = new Map(previous.map((s) => [s.name.trim().toLowerCase(), s]));
  return raw
    .split(',')
    .map((part, i) => {
      const trimmed = part.trim();
      if (!trimmed) return null;
      const colon = trimmed.lastIndexOf(':');
      let name = trimmed;
      let level: string | undefined;
      if (colon > 0) {
        const maybeLevel = trimmed.slice(colon + 1).trim();
        const maybeName = trimmed.slice(0, colon).trim();
        if (maybeName && maybeLevel && !maybeLevel.includes(' ')) {
          name = maybeName;
          level = maybeLevel;
        }
      }
      const prev = prevByName.get(name.toLowerCase());
      return {
        name,
        order: i,
        level: level ?? prev?.level,
      } satisfies SkillItem;
    })
    .filter(Boolean) as SkillItem[];
}

function skillsInputValue(skills: SkillItem[]): string {
  return skills
    .map((s) => (s.level ? `${s.name}:${s.level}` : s.name))
    .join(', ');
}

export default function AdminSkillsPage() {
  const { activeProfile } = useAdminProfile();
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [styleSaving, setStyleSaving] = useState(false);

  const themeId = settings?.portfolioTheme || 'glass';
  const displayStyle = resolveSkillsDisplayStyle(themeId, settings?.skillsDisplayStyle);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    Promise.all([adminApi.getSkills(activeProfile._id), adminApi.getSettings(activeProfile._id)])
      .then(([skillData, settingsData]) => {
        setSkills(skillData);
        setSettings(settingsData);
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load skills')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

  const setDisplayStyle = async (next: SkillsDisplayStyle) => {
    if (!activeProfile || !settings) return;
    if (settings.skillsDisplayStyle === next) return;
    const prev = settings;
    setSettings({ ...settings, skillsDisplayStyle: next });
    setStyleSaving(true);
    try {
      // Patch only this field — spreading full settings can fail access-lock checks
      // or strip unknown fields and snap the UI back to the theme default.
      const saved = await adminApi.updateSettings(activeProfile._id, {
        skillsDisplayStyle: next,
      });
      setSettings({
        ...prev,
        ...saved,
        skillsDisplayStyle: saved.skillsDisplayStyle || next,
      });
      toast.success('Skills layout updated');
    } catch (err) {
      setSettings(prev);
      toast.error(errorMessage(err, 'Failed to update layout'));
    } finally {
      setStyleSaving(false);
    }
  };

  const addCategory = async () => {
    if (!activeProfile) return;
    try {
      await adminApi.createSkill(activeProfile._id, {
        name: 'New Category',
        order: skills.length,
        skills: [],
      });
      load();
      toast.success('Category added');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to add category'));
    }
  };

  const saveCategory = async (cat: SkillCategory) => {
    if (!activeProfile) return;
    try {
      await adminApi.updateSkill(activeProfile._id, cat._id, cat);
      toast.success('Saved');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save'));
    }
  };

  const deleteCategory = async (id: string) => {
    if (!activeProfile || !confirm('Delete this category?')) return;
    try {
      await adminApi.deleteSkill(activeProfile._id, id);
      load();
      toast.success('Deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete'));
    }
  };

  const updateCat = (id: string, updates: Partial<SkillCategory>) => {
    setSkills((s) => s.map((c) => (c._id === id ? { ...c, ...updates } : c)));
  };

  const commitReorder = async (fromIndex: number, toIndex: number) => {
    if (!activeProfile) return;
    const orderedIds = reorderItemIds(skills, fromIndex, toIndex);
    const optimistic = orderedIds
      .map((id) => skills.find((s) => s._id === id))
      .filter(Boolean) as SkillCategory[];
    setSkills(optimistic);
    setReordering(true);
    try {
      const next = await adminApi.reorderSkills(activeProfile._id, orderedIds);
      setSkills(next);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to reorder'));
      load();
    } finally {
      setReordering(false);
    }
  };

  return (
    <RequireActiveProfile>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Skills</h1>
            <p className="mt-0.5 text-sm text-subtle">Grouped skills visitors can scan quickly.</p>
          </div>
          <Button onClick={addCategory}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>

        {!loading && settings ? (
          <Card className="space-y-3 p-4 sm:p-5">
            <div>
              <h2 className="text-sm font-semibold text-primary">Section styling</h2>
              <p className="text-xs text-subtle mt-0.5">
                Applies to your live portfolio Skills section for the current theme
                {settings.portfolioTheme ? ` (${settings.portfolioTheme})` : ''}.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {SKILLS_DISPLAY_STYLE_OPTIONS.map((opt) => {
                const Icon = STYLE_ICONS[opt.id];
                const selected = displayStyle === opt.id;
                const storedStyle = settings.skillsDisplayStyle;
                const isThemeDefault =
                  !storedStyle && defaultSkillsDisplayStyleForTheme(themeId) === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={styleSaving}
                    aria-pressed={selected}
                    onClick={() => setDisplayStyle(opt.id)}
                    className={cn(
                      'rounded-xl border-2 p-3 text-left transition-all bg-elevated',
                      selected
                        ? 'border-accent shadow-[0_0_0_3px_rgb(var(--accent)/0.2)]'
                        : 'border-border hover:border-accent/35'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 mb-2', selected ? 'text-accent' : 'text-subtle')} />
                    <p className="text-sm font-semibold text-primary leading-tight">{opt.label}</p>
                    <p className="text-[11px] text-subtle mt-1 leading-snug">{opt.description}</p>
                    {isThemeDefault ? (
                      <p className="text-[10px] uppercase tracking-wide text-accent mt-2">Theme default</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {(displayStyle === 'rings' || displayStyle === 'bars') && (
              <p className="text-xs text-subtle">
                Tip: set levels as <code className="text-[11px]">Name:Advanced</code> or{' '}
                <code className="text-[11px]">Name:80</code> in the skills field for better meters.
              </p>
            )}
          </Card>
        ) : null}

        {loading && <AdminListSkeleton />}

        {!loading && skills.length === 0 && (
          <AdminEmptyState
            title="Add your first skill category"
            description="Group skills like Frontend, Backend, or Tools so visitors can scan what you know."
            actionLabel="Add category"
            onAction={addCategory}
          />
        )}

        {!loading && skills.length > 0 && (
          <SortableList disabled={reordering} onReorder={commitReorder}>
            {skills.map((cat, index) => (
              <SortableItem key={cat._id} index={index}>
                <Card className="flex gap-2 items-stretch p-3 sm:p-4">
                  <SortableDragHandle
                    index={index}
                    className="self-stretch h-auto min-h-[2.5rem] w-9 rounded-md border border-transparent hover:border-border/60"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex gap-2 items-start">
                      <Input
                        value={cat.name}
                        onChange={(e) => updateCat(cat._id, { name: e.target.value })}
                        aria-label="Category name"
                        className="flex-1"
                      />
                      <Tooltip content="Save">
                        <Button size="sm" onClick={() => saveCategory(cat)} aria-label="Save category">
                          <Save className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteCategory(cat._id)}
                          aria-label="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                    <Input
                      placeholder="Skills (comma-separated), optional Name:level"
                      value={skillsInputValue(cat.skills)}
                      onChange={(e) =>
                        updateCat(cat._id, {
                          skills: parseSkillsInput(e.target.value, cat.skills),
                        })
                      }
                    />
                  </div>
                </Card>
              </SortableItem>
            ))}
          </SortableList>
        )}
      </div>
    </RequireActiveProfile>
  );
}
