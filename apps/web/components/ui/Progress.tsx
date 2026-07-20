import { cn } from '@/lib/cn';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Progress({
  value,
  max = 100,
  label,
  className,
  size = 'md',
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-ink-3">{label}</span>
          <span className="text-xs font-medium text-ink-2">
            {Math.round(percent)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
          'bg-[var(--border)]',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            'bg-gradient-to-r from-majestic-gold-dark to-majestic-gold',
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
