import { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { BRAND } from '@/brand/constants';

/** Footer share moment — copies the current folio URL. */
export default function SpotlightShareMoment({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out ${name}'s portfolio on ${BRAND.name}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text, url });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  return (
    <button type="button" onClick={share} className="spotlight-share-btn inline-flex items-center gap-1.5 text-xs">
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? 'Link copied' : 'Share this folio'}
    </button>
  );
}
