import { cn } from '@/lib/cn';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  active?: boolean;
}

export function IconButton({
  children,
  onClick,
  ariaLabel,
  className,
  disabled,
  active,
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl',
        'transition-colors duration-[var(--duration-normal)]',
        'text-ink-3 hover:text-ink hover:bg-[var(--surface-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active && 'text-accent bg-accent-subtle',
        className,
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
