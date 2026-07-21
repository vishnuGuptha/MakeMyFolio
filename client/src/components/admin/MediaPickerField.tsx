import { useCallback, useEffect, useState } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { Tooltip } from '@/components/ui/Tooltip';
import type { MediaAsset } from '@/types';

export function MediaPickerField({
  label,
  value,
  onChange,
  placeholder = 'Image URL or path',
  imagesOnly = true,
  /** Hide secondary thumbnail when the parent already shows a preview */
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  imagesOnly?: boolean;
  compact?: boolean;
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
      setMedia(imagesOnly ? items.filter((a) => a.mimeType.startsWith('image/')) : items);
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

  const libraryDialog = (
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
          <p className="py-8 text-center text-sm text-subtle">Loading media…</p>
        ) : media.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtle">No media yet. Upload a file to get started.</p>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {media.map((asset) => (
              <button
                key={asset._id}
                type="button"
                className="rounded-xl border border-border bg-base p-2 text-left transition-colors hover:border-accent"
                onClick={() => {
                  onChange(asset.url);
                  setOpen(false);
                }}
              >
                {asset.mimeType.startsWith('image/') ? (
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="mb-1 h-20 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-1 flex h-20 w-full items-center justify-center rounded-lg bg-muted text-[10px] text-subtle">
                    FILE
                  </div>
                )}
                <p className="truncate text-[10px] text-subtle">{asset.filename}</p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </DialogRoot>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        <Tooltip content={value || undefined} enabled={Boolean(value)} side="bottom">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 min-w-0 truncate text-xs"
          />
        </Tooltip>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Library
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            disabled={!value}
            onClick={() => onChange('')}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
        {libraryDialog}
      </div>
    );
  }

  return (
    <FormField label={label}>
      <div className="flex min-w-0 items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => setOpen(true)}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Library
        </Button>
      </div>
      {value ? (
        <div className="mt-2 flex items-center gap-2">
          {/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value) || value.startsWith('/uploads') ? (
            <img
              src={value}
              alt=""
              className="h-10 w-10 rounded-lg border border-border object-cover"
            />
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange('')}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      ) : null}
      {libraryDialog}
    </FormField>
  );
}
