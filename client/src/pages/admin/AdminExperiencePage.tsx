import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';
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
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { GenerateWithAiButton, AiFieldLabel } from '@/components/admin/GenerateWithAiButton';
import type { Experience } from '@/types';

const emptyExp: Partial<Experience> = {
  type: 'job',
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  bullets: [],
  projects: [],
  order: 0,
};

export default function AdminExperiencePage() {
  const { activeProfile } = useAdminProfile();
  const [items, setItems] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    adminApi
      .getExperience(activeProfile._id)
      .then(setItems)
      .catch((err) => toast.error(errorMessage(err, 'Failed to load experience')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

  const save = async () => {
    if (!activeProfile || !editing) return;
    try {
      if (editing._id) {
        await adminApi.updateExperience(activeProfile._id, editing._id, editing);
      } else {
        await adminApi.createExperience(activeProfile._id, { ...editing, order: items.length });
      }
      setEditing(null);
      load();
      toast.success('Saved');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save'));
    }
  };

  const remove = async (id: string) => {
    if (!activeProfile || !confirm('Delete?')) return;
    try {
      await adminApi.deleteExperience(activeProfile._id, id);
      load();
      toast.success('Deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete'));
    }
  };

  const commitReorder = async (fromIndex: number, toIndex: number) => {
    if (!activeProfile) return;
    const orderedIds = reorderItemIds(items, fromIndex, toIndex);
    const optimistic = orderedIds
      .map((id) => items.find((s) => s._id === id))
      .filter(Boolean) as Experience[];
    setItems(optimistic);
    setReordering(true);
    try {
      const next = await adminApi.reorderExperience(activeProfile._id, orderedIds);
      setItems(next);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to reorder'));
      load();
    } finally {
      setReordering(false);
    }
  };

  return (
    <RequireActiveProfile>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-primary">Experience & Internships</h1>
          <Button onClick={() => setEditing({ ...emptyExp })}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {editing && (
          <Card className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Type">
                <select
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm"
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value as 'job' | 'internship' })
                  }
                >
                  <option value="job">Job</option>
                  <option value="internship">Internship</option>
                </select>
              </FormField>
              <FormField label="Company">
                <Input
                  value={editing.company || ''}
                  onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                />
              </FormField>
              <FormField label="Role">
                <Input
                  value={editing.role || ''}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                />
              </FormField>
              <FormField label="Location">
                <Input
                  value={editing.location || ''}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </FormField>
              <FormField label="Start Date">
                <Input
                  value={editing.startDate || ''}
                  onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                />
              </FormField>
              <FormField label="End Date">
                <Input
                  value={editing.endDate || ''}
                  onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                />
              </FormField>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.isCurrent}
                onChange={(e) => setEditing({ ...editing, isCurrent: e.target.checked })}
              />
              Current position
            </label>
            <div>
              <AiFieldLabel label="Bullets (one per line)">
                {activeProfile && editing && (
                  <GenerateWithAiButton
                    profileId={activeProfile._id}
                    section="experienceBullets"
                    context={{
                      role: editing.role,
                      company: editing.company,
                      location: editing.location,
                      startDate: editing.startDate,
                      endDate: editing.endDate,
                      isCurrent: editing.isCurrent,
                      bullets: editing.bullets,
                    }}
                    onResult={(r) => setEditing({ ...editing, bullets: r as string[] })}
                  />
                )}
              </AiFieldLabel>
              <Textarea
                value={(editing.bullets || []).join('\n')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    bullets: e.target.value.split('\n').filter(Boolean),
                  })
                }
              />
            </div>
            <FormField label="Projects (name|url per line)">
              <Textarea
                value={(editing.projects || []).map((p) => `${p.name}|${p.url}`).join('\n')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    projects: e.target.value
                      .split('\n')
                      .filter(Boolean)
                      .map((line) => {
                        const [name, url] = line.split('|');
                        return { name: name.trim(), url: (url || '').trim(), techStack: [] };
                      }),
                  })
                }
              />
            </FormField>
            <div className="flex gap-2">
              <Button onClick={save}>
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {loading && <AdminListSkeleton />}

        {!loading && items.length === 0 && !editing && (
          <AdminEmptyState
            title="Add your first role"
            description="Jobs and internships show your career story. Start with your current or latest position."
            actionLabel="Add experience"
            onAction={() => setEditing({ ...emptyExp })}
          />
        )}

        {!loading && items.length > 0 && (
          <SortableList disabled={reordering} onReorder={commitReorder}>
            {items.map((item, index) => (
              <SortableItem key={item._id} index={index}>
                <Card className="flex justify-between items-start gap-3">
                  <SortableDragHandle index={index} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {item.role} @ {item.company}
                    </p>
                    <p className="text-xs text-subtle font-mono">
                      {item.type} · {item.startDate} — {item.isCurrent ? 'Present' : item.endDate}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => remove(item._id)}
                      aria-label="Delete experience"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
