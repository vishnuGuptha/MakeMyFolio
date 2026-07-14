import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Common = {
  children: ReactNode;
  className?: string;
  block?: boolean;
};

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AsAnchor = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export default function StudioGlowButton(props: AsButton | AsAnchor) {
  const { children, className, block, ...rest } = props;
  const classes = cn('studio-btn', block && 'studio-btn-block', className);

  if ('href' in props && props.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonRest.type || 'button'} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
