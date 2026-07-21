import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminEmptyState, AdminListSkeleton } from '@/components/admin/AdminEmptyState';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { MediaAsset } from '@/types';

export default function AdminMediaPage() {
  const { activeProfile } = useAdminProfile();
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    adminApi
      .getMedia(activeProfile._id)
      .then(setMedia)
      .catch((err) => toast.error(errorMessage(err, 'Failed to load media')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    try {
      await adminApi.uploadMedia(activeProfile._id, file);
      load();
      toast.success('Uploaded!');
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    }
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!activeProfile || !confirm('Delete this file?')) return;
    try {
      await adminApi.deleteMedia(activeProfile._id, id);
      load();
      toast.success('Deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete'));
    }
  };

  return (
    <RequireActiveProfile>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Media Library</h1>
            <p className="mt-0.5 text-sm text-subtle">Images and files for your portfolio.</p>
          </div>
          <label>
            <Button asChild>
              <span>
                <Upload className="h-4 w-4" /> Upload
              </span>
            </Button>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf" />
          </label>
        </div>

        {loading && <AdminListSkeleton rows={4} />}

        {!loading && media.length === 0 && (
          <AdminEmptyState
            title="No media uploaded yet"
            description="Upload images here, then pick them from Projects, Profile, OG image, and more via Library."
          />
        )}

        {!loading && media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map((asset) => (
              <Card key={asset._id} className="p-3">
                {asset.mimeType.startsWith('image/') ? (
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center mb-2 text-xs text-subtle font-mono">
                    PDF
                  </div>
                )}
                <p className="text-xs truncate text-secondary">{asset.filename}</p>
                <p className="text-[10px] font-mono text-subtle truncate mb-2">{asset.url}</p>
                <Button
                  size="sm"
                  variant="danger"
                  className="w-full"
                  onClick={() => handleDelete(asset._id)}
                  aria-label={`Delete ${asset.filename}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RequireActiveProfile>
  );
}
