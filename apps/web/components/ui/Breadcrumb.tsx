import { cn } from '@/lib/cn';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-sm flex-wrap', className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={item.href || item.label}
            className="flex items-center gap-1.5"
          >
            {index > 0 && (
              <span
                className="text-ink-4 flex-shrink-0"
                aria-hidden="true"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-ink-3 hover:text-ink transition-colors duration-[var(--duration-fast)]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium',
                  isLast ? 'text-ink' : 'text-ink-3',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
