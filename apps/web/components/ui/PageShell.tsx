import { cn } from '@/lib/cn';

interface PageShellProps {
  title?: string;
  eyebrow?: string;
  lede?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  title,
  eyebrow,
  lede,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 page-enter',
        className,
      )}
    >
      {(title || eyebrow || lede) && (
        <div className="mb-8 md:mb-12">
          {eyebrow && (
            <p className="text-accent font-semibold uppercase tracking-wider text-sm mb-3">
              {eyebrow}
            </p>
          )}
          {title && (
            <h1 className="text-ink text-3xl md:text-4xl font-extrabold tracking-tight">
              {title}
            </h1>
          )}
          {lede && (
            <p className="text-ink-2 text-lg mt-3 max-w-2xl leading-relaxed">
              {lede}
            </p>
          )}
          {actions && <div className="mt-4">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
