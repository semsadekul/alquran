'use client';

import { cn } from '@/lib/cn';

interface Segment {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedControl({
  segments,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl p-1 gap-0.5',
        'bg-[var(--surface-muted)] border border-line',
        className,
      )}
      role="tablist"
    >
      {segments.map((seg) => (
        <button
          key={seg.id}
          type="button"
          role="tab"
          aria-selected={value === seg.id}
          onClick={() => onChange(seg.id)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-lg min-h-[36px]',
            'transition-all duration-[var(--duration-normal)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
            value === seg.id
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-3 hover:text-ink',
          )}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
