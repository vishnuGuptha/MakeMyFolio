import { useCallback, useEffect, useState } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import type { MediaAsset } from '@/types';

export function MediaPickerField({
  label,
  value,
  onChange,
  placeholder = 'https://… or choose from library',
  imagesOnly = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  imagesOnly?: boolean;
}) {
  const { activeProfile } = useAdminProfile();
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const items = await adminApi.getMedia(activeProfile._id);
      setMedia(
        imagesOnly ? items.filter((a) => a.mimeType.startsWith('image/')) : items
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load media'));
    } finally {
      setLoading(false);
    }
  }, [activeProfile, imagesOnly]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    setUploading(true);
    try {
      const asset = await adminApi.uploadMedia(activeProfile._id, file);
      onChange(asset.url);
      setOpen(false);
      toast.success('Uploaded and selected');
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <FormField label={label}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <ImageIcon className="h-3.5 w-3.5" />
          Library
        </Button>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-3">
          {/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value) || value.startsWith('/uploads') ? (
            <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover border border-border" />
          ) : null}
          <button
            type="button"
            className="text-xs text-subtle hover:text-red-400"
            onClick={() => onChange('')}
          >
            Clear
          </button>
        </div>
      )}

      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogContent title="Choose from media library" className="max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-subtle">Select an image or upload a new one.</p>
            <label>
              <Button size="sm" variant="outline" asChild disabled={uploading}>
                <span>
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Uploading…' : 'Upload'}
                </span>
              </Button>
              <input
                type="file"
                className="hidden"
                accept={imagesOnly ? 'image/*' : 'image/*,.pdf'}
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {loading ? (
            <p className="text-sm text-subtle py-8 text-center">Loading media…</p>
          ) : media.length === 0 ? (
            <p className="text-sm text-subtle py-8 text-center">
              No media yet. Upload a file to get started.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
              {media.map((asset) => (
                <button
                  key={asset._id}
                  type="button"
                  className="rounded-xl border border-border bg-base p-2 text-left hover:border-accent transition-colors"
                  onClick={() => {
                    onChange(asset.url);
                    setOpen(false);
                  }}
                >
                  {asset.mimeType.startsWith('image/') ? (
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="h-20 w-full rounded-lg object-cover mb-1"
                    />
                  ) : (
                    <div className="h-20 w-full rounded-lg bg-muted flex items-center justify-center text-[10px] text-subtle mb-1">
                      FILE
                    </div>
                  )}
                  <p className="text-[10px] truncate text-subtle">{asset.filename}</p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </DialogRoot>
    </FormField>
  );
}
