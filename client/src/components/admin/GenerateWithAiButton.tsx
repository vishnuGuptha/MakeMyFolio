import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

export type AiEnhanceSection =
  | 'tagline'
  | 'bio'
  | 'title'
  | 'educationHighlight'
  | 'metaDescription'
  | 'experienceBullets'
  | 'projectDescription';

export function GenerateWithAiButton({
  profileId,
  section,
  context,
  onResult,
  disabled,
}: {
  profileId: string;
  section: AiEnhanceSection;
  context: Record<string, unknown>;
  onResult: (result: string | string[]) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { result } = await adminApi.enhanceWithAi(profileId, section, context);
      onResult(result);
      toast.success('Section enhanced with AI');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI enhancement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip content={loading ? 'Generating…' : 'Generate with AI'}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || loading}
        className="h-7 gap-1 border-accent/30 px-2 text-[11px] font-medium text-accent hover:bg-accent/10"
      >
        <Sparkles className="h-3 w-3" />
        {loading ? '…' : 'AI'}
      </Button>
    </Tooltip>
  );
}

export function AiFieldLabel({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex min-h-7 items-center justify-between gap-2">
      <span className="text-sm font-medium leading-none text-secondary">{label}</span>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
