import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-ink-4 opacity-60">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
      {hint && (
        <p className="text-sm text-ink-3 max-w-sm">{hint}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
