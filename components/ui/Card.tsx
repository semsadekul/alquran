import type React from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'hero';
  className?: string;
  onClick?: () => void;
}

export function Card({ children, variant = 'default', className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl transition-all duration-200',
        variant === 'default' && 'bg-surface border border-border shadow-soft',
        variant === 'elevated' && 'bg-surface-elevated border border-border shadow-elevated',
        variant === 'interactive' &&
          'bg-surface border border-border shadow-soft hover:shadow-elevated hover:border-gold/30 cursor-pointer card-lift',
        // hero — cream/tinted with gold decorative pattern, replacing the museum-blue gradient
        variant === 'hero' &&
          'relative overflow-hidden text-text border border-gold/20 shadow-elevated',
        className
      )}
    >
      {variant === 'hero' && (
        <div className="absolute inset-0 bg-gradient-to-br from-majestic-light to-majestic-dark" />
      )}
      {variant === 'hero' && (
        <div className="absolute inset-0 bg-surface/60" />
      )}
      {variant === 'hero' && (
        <div className="absolute inset-0 islamic-pattern opacity-60" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
