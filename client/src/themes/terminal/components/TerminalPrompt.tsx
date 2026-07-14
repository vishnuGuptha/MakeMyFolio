import { cn } from '@/lib/utils';

export default function TerminalPrompt({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  return (
    <p className={cn('text-subtle', className)}>
      <span className="text-accent">$</span> {command}
    </p>
  );
}
