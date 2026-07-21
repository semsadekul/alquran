'use client';

import { cn } from '@/lib/cn';
import { Children, cloneElement, useEffect, useRef, useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 200,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hide tooltip when pressing Escape
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const show = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
      // Calculate position after render
      requestAnimationFrame(() => {
        if (!triggerRef.current || !tooltipRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const tipRect = tooltipRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (side) {
          case 'top':
            top = rect.top - tipRect.height - 8;
            left = rect.left + rect.width / 2 - tipRect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2 - tipRect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tipRect.height / 2;
            left = rect.left - tipRect.width - 8;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tipRect.height / 2;
            left = rect.right + 8;
            break;
        }

        // Boundary detection
        if (top < 4) top = 4;
        if (left < 4) left = 4;
        if (top + tipRect.height > window.innerHeight - 4) {
          top = window.innerHeight - tipRect.height - 4;
        }
        if (left + tipRect.width > window.innerWidth - 4) {
          left = window.innerWidth - tipRect.width - 4;
        }

        setPosition({ top, left });
      });
    }, delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  const child = Children.only(children);
  const childWithRef = cloneElement(child, {
    ref: triggerRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  } as React.Attributes);

  return (
    <>
      {childWithRef}
      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'fixed z-50 px-3 py-1.5 text-sm font-medium text-white rounded-lg',
            'bg-[var(--tooltip-bg)] text-[var(--tooltip-text)]',
            'shadow-[var(--shadow-elevated)]',
            'pointer-events-none select-none',
            'opacity-0 animate-[fadeSlideUp_var(--duration-fast)_var(--ease-decelerate)_forwards]',
            'whitespace-nowrap',
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-[var(--tooltip-bg)] rotate-45',
              side === 'top' && 'bottom-[-5px] left-1/2 -translate-x-1/2',
              side === 'bottom' && 'top-[-5px] left-1/2 -translate-x-1/2',
              side === 'left' && 'right-[-5px] top-1/2 -translate-y-1/2',
              side === 'right' && 'left-[-5px] top-1/2 -translate-y-1/2',
            )}
          />
        </div>
      )}
    </>
  );
}
