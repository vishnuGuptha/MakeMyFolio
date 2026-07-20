import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Required Privacy + Terms acceptance for signup. */
export function LegalConsentFields({
  acceptPrivacy,
  acceptTerms,
  onPrivacyChange,
  onTermsChange,
  className,
}: {
  acceptPrivacy: boolean;
  acceptTerms: boolean;
  onPrivacyChange: (v: boolean) => void;
  onTermsChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-2', className)}>
      <label className="flex items-start gap-2 text-xs leading-snug text-secondary cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-[rgb(var(--accent))]"
          checked={acceptPrivacy}
          onChange={(e) => onPrivacyChange(e.target.checked)}
          required
        />
        <span>
          I agree to the{' '}
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </span>
      </label>
      <label className="flex items-start gap-2 text-xs leading-snug text-secondary cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-[rgb(var(--accent))]"
          checked={acceptTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          required
        />
        <span>
          I agree to the{' '}
          <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Terms of Service
          </Link>
        </span>
      </label>
    </div>
  );
}

export function canSubmitWithLegalConsent(acceptPrivacy: boolean, acceptTerms: boolean) {
  return acceptPrivacy && acceptTerms;
}
