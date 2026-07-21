'use client';

import { cn } from '@/lib/cn';
import React, {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  close: () => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

interface DropdownMenuProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  children: React.ReactNode;
}

export function DropdownMenu({ items, onSelect, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
    triggerRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (item: MenuItem) => {
      onSelect(item);
      close();
    },
    [onSelect, close],
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  const value: DropdownMenuContextValue = {
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    items,
    onSelect: handleSelect,
    close,
  };

  return (
    <DropdownMenuContext.Provider value={value}>
      <div ref={menuRef} className="relative inline-block text-left">
        {/* Trigger — clone child to attach ref and handlers */}
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactElement;
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenuTrigger must be inside DropdownMenu');

  const child = React.Children.only(children);
  return React.cloneElement(child as React.ReactElement<{
    onClick?: () => void;
    'aria-haspopup'?: string;
    'aria-expanded'?: boolean;
  }>, {
    onClick: () => ctx.setOpen(!ctx.open),
    'aria-haspopup': 'menu',
    'aria-expanded': ctx.open,
  });
}

interface DropdownMenuContentProps {
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenuContent({
  align = 'left',
  className,
}: DropdownMenuContentProps) {
  const ctx = useContext(DropdownMenuContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!ctx || !ctx.open || !contentRef.current) return;

    const updatePosition = () => {
      const rect = contentRef.current!.getBoundingClientRect();
      let top = rect.height + 4;
      let left = 0;

      if (align === 'right') {
        left = -(rect.width);
      }

      // Boundary detection
      if (left < 4) left = 4;
      if (top + rect.height > window.innerHeight - 4) {
        top = window.innerHeight - rect.height - 4;
      }
      if (left + rect.width > window.innerWidth - 4) {
        left = window.innerWidth - rect.width - 4;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [ctx?.open, align]);

  // Keyboard navigation
  useEffect(() => {
    if (!ctx || !ctx.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const enabled = ctx.items
          .map((it, i) => ({ ...it, i }))
          .filter((it) => !it.disabled);
        if (enabled.length === 0) return;
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const idx = enabled.findIndex((it) => it.i === ctx.activeIndex);
        const next = (idx + dir + enabled.length) % enabled.length;
        ctx.setActiveIndex(enabled[next].i);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = ctx.items[ctx.activeIndex];
        if (item && !item.disabled) ctx.onSelect(item);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [ctx, ctx?.open, ctx?.activeIndex]);

  if (!ctx || !ctx.open) return null;

  return (
    <div
      ref={contentRef}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        'fixed z-50 min-w-[200px] py-1 rounded-lg',
        'bg-surface border border-line',
        'shadow-[var(--shadow-elevated)]',
        'animate-[fadeSlideUp_var(--duration-fast)_var(--ease-decelerate)]',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {ctx.items.map((item, index) => (
        <button
          key={item.id}
          role="menuitem"
          disabled={item.disabled}
          tabIndex={-1}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm',
            'transition-colors duration-[var(--duration-fast)]',
            item.disabled
              ? 'text-ink-4 cursor-not-allowed'
              : item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-ink hover:bg-[var(--surface-hover)]',
            index === ctx.activeIndex &&
              !item.disabled &&
              'bg-[var(--accent-subtle)]',
          )}
          onMouseEnter={() => !item.disabled && ctx.setActiveIndex(index)}
          onClick={() => !item.disabled && ctx.onSelect(item)}
        >
          {item.icon && (
            <span
              className={cn(
                'flex-shrink-0 w-5 h-5',
                item.danger ? 'text-red-500' : 'text-ink-3',
              )}
            >
              {item.icon}
            </span>
          )}
          <span className="flex-1 text-left">{item.label}</span>
          {item.shortcut && (
            <span className="text-xs text-ink-4 ml-auto font-mono">
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function useDropdownMenu() {
  return useContext(DropdownMenuContext);
}
