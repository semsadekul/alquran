import type React from 'react';
import clsx from 'clsx';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  disabled = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // primary — solid gold (dark text on gold for AA contrast)
        variant === 'primary' && 'bg-gold text-[#1a1814] hover:bg-gold-dark hover:text-white active:scale-[0.98] shadow-soft',
        variant === 'secondary' && 'bg-surface-3 text-text border border-border hover:bg-surface-highlight active:scale-[0.98]',
        // outline — gold-tinted hairline border on timeless hairline
        variant === 'outline' && 'border border-border bg-transparent text-text hover:border-gold/40 hover:bg-surface-highlight hover:text-gold-dark active:scale-[0.98]',
        // ghost — transparent with gold hover tint
        variant === 'ghost' && 'bg-transparent text-text hover:bg-surface-highlight hover:text-gold-dark active:scale-[0.98]',
        variant === 'danger' && 'bg-error text-white hover:bg-[color:var(--error)]/90 active:scale-[0.98]',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-[15px]',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
