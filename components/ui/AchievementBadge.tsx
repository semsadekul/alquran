'use client';

import { cn } from '@/lib/cn';
import { Card } from './Card';
import { Badge } from './Badge';

interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
  className?: string;
  onClick?: () => void;
}

export function AchievementBadge({
  icon,
  title,
  description,
  unlocked,
  date,
  className,
  onClick,
}: AchievementBadgeProps) {
  return (
    <Card
      variant={unlocked ? 'interactive' : 'default'}
      className={cn(
        'relative overflow-hidden group',
        'transition-all duration-500 ease-spring',
        unlocked
          ? 'bg-gradient-to-br from-white to-[var(--bg-subtle)] dark:from-[var(--surface-elevated)] dark:to-[var(--surface-muted)] shadow-[var(--shadow-elevated)]'
          : 'opacity-60 grayscale',
        className,
      )}
      onClick={onClick}
    >
      {/* Unlock animation overlay */}
      {unlocked && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      
      {/* Confetti hint for unlocked badges */}
      {unlocked && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="w-1 h-1 rounded-full bg-gold-light animate-pulse delay-75" />
          <span className="w-1 h-1 rounded-full bg-gold-soft animate-pulse delay-150" />
        </div>
      )}
      
      <div className="flex items-start gap-4 relative z-10">
        {/* Icon container */}
        <div
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center',
            'transition-all duration-300 ease-spring',
            unlocked
              ? 'bg-gradient-to-br from-gold to-gold-light text-majestic-darker shadow-lg scale-100'
              : 'bg-[var(--border-subtle)] text-ink-3 scale-95',
          )}
        >
          <div className={cn('transition-transform duration-500', unlocked && 'group-hover:scale-110 group-hover:rotate-6')}>
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={cn(
                'text-sm font-semibold truncate',
                unlocked ? 'text-ink' : 'text-ink-3',
              )}
            >
              {title}
            </h4>
            {unlocked && (
              <Badge tone="gold" className="ml-auto">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Badge>
            )}
          </div>
          
          <p
            className={cn(
              'text-xs leading-relaxed mb-2',
              unlocked ? 'text-ink-3' : 'text-ink-4',
            )}
          >
            {description}
          </p>
          
          {date && (
            <div className="flex items-center gap-1.5 text-xs">
              <svg
                className={cn('w-3 h-3', unlocked ? 'text-ink-3' : 'text-ink-4')}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className={cn(unlocked ? 'text-ink-3' : 'text-ink-4')}>
                {date}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
