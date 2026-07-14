import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '@/api';
import { PortfolioSkeleton } from '@/components/ui/Skeleton';

export default function DefaultRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    publicApi
      .getDefaultSlug()
      .then(({ slug }) => {
        if (slug) navigate(`/${slug}`, { replace: true });
        else navigate('/not-found', { replace: true });
      })
      .catch(() => navigate('/not-found', { replace: true }));
  }, [navigate]);

  return <PortfolioSkeleton />;
}
