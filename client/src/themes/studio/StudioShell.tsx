import type { ShellProps } from '../types';

export default function StudioShell({ children }: ShellProps) {
  return <div className="studio-shell min-h-screen">{children}</div>;
}
