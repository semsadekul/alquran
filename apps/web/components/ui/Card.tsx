import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'interactive' | 'hero';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  as?: 'div' | 'article' | 'section';
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-surface border border-line rounded-2xl shadow-[var(--shadow-card)]',
  interactive:
    'bg-surface border border-line rounded-2xl shadow-[var(--shadow-card)] transition-transform duration-[var(--duration-normal)] ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-[var(--border-focus)] hover:shadow-[var(--shadow-elevated)]',
  hero: 'rounded-2xl bg-gradient-to-br from-majestic-dark to-majestic-light text-white shadow-[var(--shadow-elevated)]',
};

export function Card({
  variant = 'default',
  className,
  children,
  onClick,
  as: Tag = 'div',
}: CardProps) {
  const classes = cn(
    variantStyles[variant],
    'p-5 md:p-6',
    onClick && 'cursor-pointer',
    className,
  );

  if (onClick) {
    return (
      <Tag
        className={classes}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {children}
      </Tag>
    );
  }

  return <Tag className={classes}>{children}</Tag>;
}
