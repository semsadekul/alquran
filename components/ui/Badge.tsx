import type React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'gold' | 'classic';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        tone === 'neutral' && 'bg-surface-highlight text-text-muted border border-border-subtle',
        // primary aliased onto gold
        tone === 'primary' && 'bg-gold/12 text-gold-dark border border-gold/25',
        tone === 'success' && 'bg-success/12 text-success border border-success/25',
        tone === 'warning' && 'bg-warning/12 text-warning border border-warning/25',
        tone === 'error' && 'bg-error/12 text-error border border-error/25',
        // gold — gradient ring (kept for legacy callers)
        tone === 'gold' && 'bg-gradient-to-r from-gold-dark/15 to-gold/15 text-gold-dark border border-gold/30',
        // classic — cream surface with gold hairline border and gold text
        tone === 'classic' && 'bg-cream text-gold-dark border border-gold/30 tracking-wide',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        className
      )}
    >
      {children}
    </span>
  );
}
