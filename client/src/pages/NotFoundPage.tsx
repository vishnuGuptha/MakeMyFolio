import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-accent text-sm mb-4">404</p>
        <h1 className="text-4xl font-bold text-primary mb-4">Portfolio Not Found</h1>
        <p className="text-secondary mb-8">
          This portfolio doesn't exist or hasn't been published yet.
        </p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
