import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '@/api';
import { usesSubdomainPortfolios } from '@/lib/domains';
import { getPublicPortfolioUrl } from '@/lib/utils';
import { PortfolioSkeleton } from '@/components/ui/Skeleton';

export default function DefaultRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    publicApi
      .getDefaultSlug()
      .then(({ slug }) => {
        if (!slug) {
          navigate('/not-found', { replace: true });
          return;
        }
        if (usesSubdomainPortfolios()) {
          window.location.replace(getPublicPortfolioUrl(slug));
          return;
        }
        navigate(`/${slug}`, { replace: true });
      })
      .catch(() => navigate('/not-found', { replace: true }));
  }, [navigate]);

  return <PortfolioSkeleton />;
}
