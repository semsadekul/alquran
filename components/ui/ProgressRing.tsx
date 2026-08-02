'use client';

import { cn } from '@/lib/cn';

type ProgressRingSize = 'sm' | 'md' | 'lg';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: ProgressRingSize;
  gradient?: 'gold' | 'green' | 'classic' | 'custom';
  animated?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

const sizeConfig: Record<ProgressRingSize, { size: number; strokeWidth: number; fontSize: string }> = {
  sm: { size: 80, strokeWidth: 8, fontSize: 'text-lg' },
  md: { size: 120, strokeWidth: 10, fontSize: 'text-xl' },
  lg: { size: 160, strokeWidth: 12, fontSize: 'text-2xl' },
};

const gradientDefs: Record<string, string> = {
  gold: 'url(#goldGradient)',
  green: 'url(#greenGradient)',
  classic: 'url(#classicGradient)',
  custom: 'url(#customGradient)',
};

export function ProgressRing({
  value,
  max = 100,
  size = 'md',
  gradient = 'gold',
  animated = true,
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const config = sizeConfig[size];
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={config.size}
          height={config.size}
          viewBox={`0 0 ${config.size} ${config.size}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b8924e" />
              <stop offset="50%" stopColor="#d0a85e" />
              <stop offset="100%" stopColor="#9a7a3c" />
            </linearGradient>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="classicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b8964a" />
              <stop offset="50%" stopColor="#d0a85e" />
              <stop offset="100%" stopColor="#2c2a26" />
            </linearGradient>
            <linearGradient id="customGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b3d28" />
              <stop offset="50%" stopColor="#166040" />
              <stop offset="100%" stopColor="#b8924e" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke="var(--border-subtle)"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke={gradientDefs[gradient]}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : 0}
            className={animated ? 'transition-all duration-1000 ease-out' : ''}
            style={{
              strokeDashoffset,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold text-ink', config.fontSize)}>
            {value}
          </span>
          {max && (
            <span className="text-xs text-ink-3 -mt-0.5">
              /{max}
            </span>
          )}
        </div>
      </div>
      
      {label && (
        <span className="text-sm font-medium text-ink-2 text-center">
          {label}
        </span>
      )}
      
      {sublabel && (
        <span className="text-xs text-ink-3 text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
}
