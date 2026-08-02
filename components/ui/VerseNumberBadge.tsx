'use client';

import { cn } from '@/lib/cn';

interface VerseNumberBadgeProps {
  number: number;
  active?: boolean;
  sajdah?: boolean;
  onClick?: (verseNumber: number) => void;
  className?: string;
}

export function VerseNumberBadge({
  number,
  active = false,
  sajdah = false,
  onClick,
  className,
}: VerseNumberBadgeProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(number);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Verse ${number}${sajdah ? ', includes Sajdah' : ''}`}
      className={cn(
        'relative flex items-center justify-center',
        'w-11 h-11 min-w-[44px] min-h-[44px]',
        'rounded-full',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'hover:scale-110 active:scale-95',
        active
          ? 'bg-gradient-to-br from-[#b8924e] via-[#d0a85e] to-[#9a7a3c] text-white shadow-lg shadow-gold/25 scale-105'
          : 'bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink hover:shadow-soft border border-border-subtle',
        className
      )}
    >
      {/* Ornamental SVG border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8924e" />
            <stop offset="50%" stopColor="#d0a85e" />
            <stop offset="100%" stopColor="#9a7a3c" />
          </linearGradient>
        </defs>
        
        {/* Outer decorative ring */}
        <circle
          cx="22"
          cy="22"
          r="20"
          stroke={active ? 'url(#badgeGold)' : 'var(--border-default)'}
          strokeWidth="1.5"
          fill="none"
          className={cn(
            'transition-colors duration-300',
            active ? 'opacity-100' : 'opacity-60'
          )}
        />
        
        {/* Inner ornamental polygon pattern */}
        <path
          d="M22 6 L26 10 L30 14 L34 18 L38 22 L34 26 L30 30 L26 34 L22 38 L18 34 L14 30 L10 26 L6 22 L10 18 L14 14 L18 10 Z"
          stroke={active ? 'url(#badgeGold)' : 'var(--border-subtle)'}
          strokeWidth="1"
          fill="none"
          className={cn(
            'transition-colors duration-300',
            active ? 'opacity-80' : 'opacity-40'
          )}
        />
      </svg>

      {/* Verse number */}
      <span
        className={cn(
          'relative z-10 text-sm font-semibold',
          'transition-colors duration-300'
        )}
      >
        {number.toLocaleString('ar-EG')}
      </span>

      {/* Sajdah indicator */}
      {sajdah && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-error rounded-full shadow-sm ring-2 ring-surface-1"
          aria-label="Sajdah verse"
          title="Verse of prostration"
        />
      )}

      {/* Active state glow effect */}
      {active && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent pointer-events-none animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      )}
    </button>
  );
}
