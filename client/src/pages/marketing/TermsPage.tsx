import { Link } from 'react-router-dom';
import { BRAND } from '@/brand/constants';
import { BrandLogo } from '@/brand/logo';

export default function TermsPage() {
  return (
    <div className="min-h-svh marketing-mesh">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link to="/" className="inline-block">
          <BrandLogo size={28} />
        </Link>
        <h1 className="mt-8 font-display text-3xl text-primary">Terms of Service</h1>
        <p className="mt-2 text-sm text-subtle">Last updated {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-4 text-sm text-secondary leading-relaxed">
          <p>
            By creating an account on {BRAND.name}, you agree to use the service lawfully and not to upload
            content that infringes others’ rights or violates applicable law.
          </p>
          <p>
            You retain ownership of the content you submit. You grant {BRAND.name} a limited license to host,
            display, and process that content solely to operate the product (including public folios you
            choose to publish).
          </p>
          <p>
            Free and paid plans may include usage limits. We may update features, pricing, or these terms
            with reasonable notice when material changes apply.
          </p>
          <p>
            The service is provided “as is.” To the extent permitted by law, {BRAND.name} is not liable for
            indirect or consequential damages arising from use of the platform.
          </p>
          <p>
            Continued use of {BRAND.domain} after updates constitutes acceptance of the revised terms.
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
