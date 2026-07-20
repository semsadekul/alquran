import { cn } from '@/lib/cn';

type BadgeTone = 'gold' | 'green' | 'neutral' | 'danger';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const toneStyles: Record<BadgeTone, string> = {
  gold: 'bg-gold-subtle text-gold border-gold/20',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30',
  neutral: 'bg-[var(--surface-muted)] text-ink-3 border-line-subtle',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/30',
};

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
