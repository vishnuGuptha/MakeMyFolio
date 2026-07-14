import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { Button } from '@/components/ui/Button';

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
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || loading}
      className="text-accent border-accent/30 hover:bg-accent/10"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {loading ? 'Generating...' : 'Generate with AI'}
    </Button>
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
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <span className="text-sm font-medium text-primary">{label}</span>
      {children}
    </div>
  );
}
