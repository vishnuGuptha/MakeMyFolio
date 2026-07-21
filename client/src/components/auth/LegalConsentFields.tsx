import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Required Privacy + Terms acceptance for signup. */
export function LegalConsentFields({
  acceptPrivacy,
  acceptTerms,
  onPrivacyChange,
  onTermsChange,
  className,
  variant = 'boxed',
}: {
  acceptPrivacy: boolean;
  acceptTerms: boolean;
  onPrivacyChange: (v: boolean) => void;
  onTermsChange: (v: boolean) => void;
  className?: string;
  /** boxed = bordered card; plain = checklist only */
  variant?: 'boxed' | 'plain';
}) {
  return (
    <div
      className={cn(
        'space-y-2',
        variant === 'boxed' && 'rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5',
        className
      )}
    >
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-snug text-secondary">
        <input
          type="checkbox"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-[#0066FF]"
          checked={acceptPrivacy}
          onChange={(e) => onPrivacyChange(e.target.checked)}
          required
        />
        <span>
          I agree to the{' '}
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0066FF] hover:underline"
          >
            Privacy Policy
          </Link>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-snug text-secondary">
        <input
          type="checkbox"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-[#0066FF]"
          checked={acceptTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          required
        />
        <span>
          I agree to the{' '}
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0066FF] hover:underline"
          >
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
