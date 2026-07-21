import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save, FileUp, X } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminEmptyState, AdminListSkeleton } from '@/components/admin/AdminEmptyState';
import { MediaPickerField } from '@/components/admin/MediaPickerField';
import { isDocumentUrl } from '@/components/EducationAttachment';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import type { Education, Certification } from '@/types';

function CrudList<T extends { _id: string }>({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
  render,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  render: (item: T) => React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {items.length === 0 ? (
        <AdminEmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="Add"
          onAction={onAdd}
        />
      ) : (
        items.map((item) => (
          <Card key={item._id} className="flex justify-between items-center">
            {render(item)}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(item._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default function AdminEducationPage() {
  const { activeProfile } = useAdminProfile();
  const [education, setEducation] = useState<Education[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [editEdu, setEditEdu] = useState<Partial<Education> | null>(null);
  const [editCert, setEditCert] = useState<Partial<Certification> | null>(null);
  const [uploadingEdu, setUploadingEdu] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    Promise.all([
      adminApi.getEducation(activeProfile._id),
      adminApi.getCertifications(activeProfile._id),
    ])
      .then(([edu, c]) => {
        setEducation(edu);
        setCerts(c);
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load education')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

  const saveEdu = async () => {
    if (!activeProfile || !editEdu) return;
    try {
      if (editEdu._id) await adminApi.updateEducation(activeProfile._id, editEdu._id, editEdu);
      else await adminApi.createEducation(activeProfile._id, { ...editEdu, order: education.length });
      setEditEdu(null);
      load();
      toast.success('Saved');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save'));
    }
  };

  const saveCert = async () => {
    if (!activeProfile || !editCert) return;
    try {
      if (editCert._id) await adminApi.updateCertification(activeProfile._id, editCert._id, editCert);
      else await adminApi.createCertification(activeProfile._id, { ...editCert, order: certs.length });
      setEditCert(null);
      load();
      toast.success('Saved');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save'));
    }
  };

  const handleEduFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile || !editEdu) return;
    setUploadingEdu(true);
    try {
      const asset = await adminApi.uploadMedia(activeProfile._id, file);
      setEditEdu({ ...editEdu, imageUrl: asset.url });
      toast.success('Document uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingEdu(false);
      e.target.value = '';
    }
  };

  const handleCertFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile || !editCert) return;
    setUploadingCert(true);
    try {
      const asset = await adminApi.uploadMedia(activeProfile._id, file);
      setEditCert({ ...editCert, imageUrl: asset.url });
      toast.success('Certificate file uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingCert(false);
      e.target.value = '';
    }
  };

  return (
    <RequireActiveProfile>
      <div className="mx-auto max-w-6xl space-y-8">
        {loading && <AdminListSkeleton rows={4} />}

        {!loading && editEdu && (
          <Card className="space-y-4">
            <h3 className="font-semibold">Edit Education</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Degree">
                <Input
                  value={editEdu.degree || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, degree: e.target.value })}
                />
              </FormField>
              <FormField label="Institution">
                <Input
                  value={editEdu.institution || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, institution: e.target.value })}
                />
              </FormField>
              <FormField label="Location">
                <Input
                  value={editEdu.location || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, location: e.target.value })}
                />
              </FormField>
              <FormField label="CGPA">
                <Input
                  value={editEdu.cgpa || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, cgpa: e.target.value })}
                />
              </FormField>
              <FormField label="Start Year">
                <Input
                  value={editEdu.startYear || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, startYear: e.target.value })}
                />
              </FormField>
              <FormField label="End Year">
                <Input
                  value={editEdu.endYear || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, endYear: e.target.value })}
                />
              </FormField>
              <FormField label="Status">
                <Input
                  value={editEdu.status || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, status: e.target.value })}
                  placeholder="Completed, In Progress…"
                />
              </FormField>
              <FormField label="Credential / document URL">
                <Input
                  value={editEdu.url || ''}
                  onChange={(e) => setEditEdu({ ...editEdu, url: e.target.value })}
                  placeholder="https://… (degree, marksheet, appreciation letter…)"
                />
              </FormField>
            </div>

            <MediaPickerField
              label="Screenshot (degree, marksheet, appreciation, etc.)"
              value={isDocumentUrl(editEdu.imageUrl || '') ? '' : editEdu.imageUrl || ''}
              onChange={(url) => setEditEdu({ ...editEdu, imageUrl: url })}
              imagesOnly
            />
            <FormField label="Or upload a PDF / document">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40">
                  <FileUp className="h-4 w-4" />
                  {uploadingEdu ? 'Uploading…' : 'Upload file'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,application/pdf"
                    disabled={uploadingEdu}
                    onChange={handleEduFileUpload}
                  />
                </label>
                {editEdu.imageUrl && isDocumentUrl(editEdu.imageUrl) && (
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href={editEdu.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View document
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditEdu({ ...editEdu, imageUrl: '' })}
                      aria-label="Remove education file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </FormField>

            <div className="flex gap-2">
              <Button onClick={saveEdu}>
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button variant="outline" onClick={() => setEditEdu(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {!loading && (
          <CrudList
            title="Education"
            items={education}
            emptyTitle="Add your first school"
            emptyDescription="Degrees, marksheets, and related documents round out your profile for recruiters."
            onAdd={() =>
              setEditEdu({
                degree: '',
                institution: '',
                location: '',
                startYear: '',
                endYear: '',
                cgpa: '',
                status: '',
                url: '',
                imageUrl: '',
                order: 0,
              })
            }
            onEdit={setEditEdu}
            onDelete={async (id) => {
              if (activeProfile && confirm('Delete?')) {
                try {
                  await adminApi.deleteEducation(activeProfile._id, id);
                  load();
                  toast.success('Deleted');
                } catch (err) {
                  toast.error(errorMessage(err, 'Failed to delete'));
                }
              }
            }}
            render={(e) => (
              <div className="flex items-center gap-3 min-w-0">
                {e.imageUrl && !isDocumentUrl(e.imageUrl) ? (
                  <img
                    src={e.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-md border border-border object-cover shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="font-medium truncate">{e.degree}</p>
                  <p className="text-sm text-subtle truncate">
                    {e.institution}
                    {e.imageUrl || e.url ? ' · file attached' : ''}
                  </p>
                </div>
              </div>
            )}
          />
        )}

        {!loading && editCert && (
          <Card className="space-y-4">
            <h3 className="font-semibold">Edit Certification</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Name">
                <Input
                  value={editCert.name || ''}
                  onChange={(e) => setEditCert({ ...editCert, name: e.target.value })}
                />
              </FormField>
              <FormField label="Issuer">
                <Input
                  value={editCert.issuer || ''}
                  onChange={(e) => setEditCert({ ...editCert, issuer: e.target.value })}
                />
              </FormField>
              <FormField label="Year">
                <Input
                  value={editCert.year || ''}
                  onChange={(e) => setEditCert({ ...editCert, year: e.target.value })}
                />
              </FormField>
              <FormField label="Credential URL">
                <Input
                  value={editCert.url || ''}
                  onChange={(e) => setEditCert({ ...editCert, url: e.target.value })}
                  placeholder="https://…"
                />
              </FormField>
            </div>

            <MediaPickerField
              label="Certificate screenshot"
              value={isDocumentUrl(editCert.imageUrl || '') ? '' : editCert.imageUrl || ''}
              onChange={(url) => setEditCert({ ...editCert, imageUrl: url })}
              imagesOnly
            />
            <FormField label="Or upload a PDF / document">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40">
                  <FileUp className="h-4 w-4" />
                  {uploadingCert ? 'Uploading…' : 'Upload file'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,application/pdf"
                    disabled={uploadingCert}
                    onChange={handleCertFileUpload}
                  />
                </label>
                {editCert.imageUrl && isDocumentUrl(editCert.imageUrl) && (
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href={editCert.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View document
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditCert({ ...editCert, imageUrl: '' })}
                      aria-label="Remove certificate file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </FormField>

            <div className="flex gap-2">
              <Button onClick={saveCert}>
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button variant="outline" onClick={() => setEditCert(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {!loading && (
          <CrudList
            title="Certifications"
            items={certs}
            emptyTitle="Add your first certification"
            emptyDescription="Optional credentials and screenshots from your media library."
            onAdd={() =>
              setEditCert({ name: '', issuer: '', year: '', url: '', imageUrl: '', order: 0 })
            }
            onEdit={setEditCert}
            onDelete={async (id) => {
              if (activeProfile && confirm('Delete?')) {
                try {
                  await adminApi.deleteCertification(activeProfile._id, id);
                  load();
                  toast.success('Deleted');
                } catch (err) {
                  toast.error(errorMessage(err, 'Failed to delete'));
                }
              }
            }}
            render={(c) => (
              <div className="flex items-center gap-3">
                {c.imageUrl && !isDocumentUrl(c.imageUrl) ? (
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-md border border-border object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-subtle">
                    {c.issuer}
                    {c.imageUrl ? ' · file attached' : ''}
                  </p>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </RequireActiveProfile>
  );
}
