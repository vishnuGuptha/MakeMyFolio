import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminEmptyState, AdminListSkeleton } from '@/components/admin/AdminEmptyState';
import { MediaPickerField } from '@/components/admin/MediaPickerField';
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
import type { Project } from '@/types';

const empty: Partial<Project> = {
  title: '',
  description: '',
  techStack: [],
  liveUrl: '',
  githubUrl: '',
  imageUrl: '',
  featured: false,
  isPersonalProject: false,
  order: 0,
  startDate: '',
  endDate: '',
};

export default function AdminProjectsPage() {
  const { activeProfile } = useAdminProfile();
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    adminApi
      .getProjects(activeProfile._id)
      .then(setItems)
      .catch((err) => toast.error(errorMessage(err, 'Failed to load projects')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

  const save = async () => {
    if (!activeProfile || !editing) return;
    const data = {
      ...editing,
      techStack:
        typeof editing.techStack === 'string'
          ? (editing.techStack as unknown as string)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : editing.techStack,
    };
    try {
      if (editing._id) {
        await adminApi.updateProject(activeProfile._id, editing._id, data);
      } else {
        await adminApi.createProject(activeProfile._id, { ...data, order: items.length });
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
      await adminApi.deleteProject(activeProfile._id, id);
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
      .filter(Boolean) as Project[];
    setItems(optimistic);
    setReordering(true);
    try {
      const next = await adminApi.reorderProjects(activeProfile._id, orderedIds);
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
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Projects</h1>
            <p className="mt-0.5 text-sm text-subtle">Case studies and work samples.</p>
          </div>
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {editing && (
          <Card className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Title">
                <Input
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </FormField>
              <FormField label="Tech Stack (comma-separated)">
                <Input
                  value={(editing.techStack || []).join(', ')}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      techStack: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                />
              </FormField>
              <FormField label="Live URL">
                <Input
                  value={editing.liveUrl || ''}
                  onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                />
              </FormField>
              <FormField label="GitHub URL">
                <Input
                  value={editing.githubUrl || ''}
                  onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })}
                />
              </FormField>
              <div className="md:col-span-2">
                <MediaPickerField
                  label="Project image"
                  value={editing.imageUrl || ''}
                  onChange={(url) => setEditing({ ...editing, imageUrl: url })}
                />
              </div>
              <FormField label="Dates">
                <Input
                  placeholder="Start — End"
                  value={`${editing.startDate || ''} — ${editing.endDate || ''}`}
                  onChange={(e) => {
                    const [s, end] = e.target.value.split('—').map((x) => x.trim());
                    setEditing({ ...editing, startDate: s || '', endDate: end || '' });
                  }}
                />
              </FormField>
            </div>
            <div>
              <AiFieldLabel label="Description">
                {activeProfile && editing && (
                  <GenerateWithAiButton
                    profileId={activeProfile._id}
                    section="projectDescription"
                    context={{
                      title: editing.title,
                      description: editing.description,
                      techStack: editing.techStack,
                      liveUrl: editing.liveUrl,
                      githubUrl: editing.githubUrl,
                    }}
                    onResult={(r) => setEditing({ ...editing, description: r as string })}
                  />
                )}
              </AiFieldLabel>
              <Textarea
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />{' '}
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.isPersonalProject}
                  onChange={(e) => setEditing({ ...editing, isPersonalProject: e.target.checked })}
                />{' '}
                Personal Project
              </label>
            </div>
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
            title="Add your first project"
            description="Highlight apps, side projects, or case studies. An image from your media library helps them stand out."
            actionLabel="Add project"
            onAction={() => setEditing({ ...empty })}
          />
        )}

        {!loading && items.length > 0 && (
          <SortableList disabled={reordering} onReorder={commitReorder}>
            {items.map((item, index) => (
              <SortableItem key={item._id} index={index}>
                <Card className="flex justify-between gap-3 items-start">
                  <SortableDragHandle index={index} />
                  <div className="flex gap-3 min-w-0 flex-1">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover shrink-0 border border-border"
                        draggable={false}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-subtle">
                        {item.featured ? 'Featured' : ''}{' '}
                        {item.isPersonalProject ? '· Personal' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => remove(item._id)}
                      aria-label="Delete project"
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
