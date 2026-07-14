import { Link } from 'react-router-dom';
import { BRAND } from '@/brand/constants';
import { BrandLogo } from '@/brand/logo';

export default function PrivacyPage() {
  return (
    <div className="min-h-svh marketing-mesh">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link to="/" className="inline-block">
          <BrandLogo size={28} />
        </Link>
        <h1 className="mt-8 font-display text-3xl text-primary">Privacy Policy</h1>
        <p className="mt-2 text-sm text-subtle">Last updated {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-4 text-sm text-secondary leading-relaxed">
          <p>
            {BRAND.name} (“we”) collects account details you provide (such as name and email), portfolio
            content you upload, and basic usage data needed to run the service at {BRAND.domain}.
          </p>
          <p>
            We use this information to create and host your folio, authenticate your account, improve the
            product, and contact you about service updates. We do not sell your personal data.
          </p>
          <p>
            Content you publish on a public slug may be visible to anyone with the URL. Drafts and
            unpublished folios stay private to your account.
          </p>
          <p>
            You may request account or data deletion by contacting us through the product support channels.
            We retain data only as long as needed to provide {BRAND.name} or meet legal obligations.
          </p>
          <p>
            Questions? Reach us via the contact options on {BRAND.url}.
          </p>
        </div>
        <p className="mt-10 text-sm">
          <Link to="/register" className="text-accent hover:underline">
            ← Back to register
          </Link>
        </p>
      </div>
    </div>
  );
}
