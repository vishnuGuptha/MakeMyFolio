import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAvatarProps {
  imageUrl?: string;
  name: string;
  className?: string;
}

const avatarSize =
  'h-48 w-48 sm:h-56 sm:w-56 md:h-60 md:w-60 lg:h-64 lg:w-64 xl:h-72 xl:w-72 max-w-[min(100%,18rem)]';

export default function FloatingAvatar({ imageUrl, name, className }: FloatingAvatarProps) {
  return (
    <div className={cn('spotlight-avatar-float shrink-0', className)}>
      <div className="spotlight-avatar-ring">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={cn(avatarSize, 'rounded-full object-cover aspect-square')}
          />
        ) : (
          <div className={cn(avatarSize, 'rounded-full bg-muted/30 flex items-center justify-center aspect-square')}>
            <User className="h-16 w-16 sm:h-20 sm:w-20 text-subtle" />
          </div>
        )}
      </div>
    </div>
  );
}
