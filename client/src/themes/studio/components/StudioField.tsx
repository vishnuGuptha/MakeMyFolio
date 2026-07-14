import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function StudioField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('studio-field', className)}>
      <label>{label}</label>
      {children}
      {error && <p className="studio-field-error">{error}</p>}
    </div>
  );
}

export function StudioInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function StudioTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} />;
}
