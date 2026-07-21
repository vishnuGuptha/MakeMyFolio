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
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import type { SkillCategory } from '@/types';

export default function AdminSkillsPage() {
  const { activeProfile } = useAdminProfile();
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    adminApi
      .getSkills(activeProfile._id)
      .then(setSkills)
      .catch((err) => toast.error(errorMessage(err, 'Failed to load skills')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

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
                        <Button
                          size="sm"
                          onClick={() => saveCategory(cat)}
                          aria-label="Save category"
                        >
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
                      placeholder="Skills (comma-separated)"
                      value={cat.skills.map((s) => s.name).join(', ')}
                      onChange={(e) =>
                        updateCat(cat._id, {
                          skills: e.target.value
                            .split(',')
                            .map((name, i) => ({ name: name.trim(), order: i }))
                            .filter((s) => s.name),
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
