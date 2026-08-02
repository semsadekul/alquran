import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'rounded';
  width?: string;
  height?: string;
}

export function Skeleton({ className, variant = 'rectangular', width, height }: SkeletonProps) {
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'shimmer select-none',
        variantClasses[variant],
        width && `w-[${width}]`,
        height && `h-[${height}]`,
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// --- Pre-built skeleton variants for common use cases ---

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
  const skeletonLines = Array.from({ length: lines }, (_, i) => (
    <Skeleton
      key={i}
      variant="text"
      height="14px"
      className={cn(
        'mb-2',
        i === lines - 1 && 'mb-0 w-3/4',
        className
      )}
    />
  ));

  return <div className="flex flex-col">{skeletonLines}</div>;
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <Skeleton variant="circular" width="40px" height="40px" />
      <div className="space-y-2">
        <Skeleton variant="text" height="16px" className="w-3/4" />
        <Skeleton variant="text" height="14px" className="w-1/2" />
      </div>
      <Skeleton variant="text" height="14px" className="w-full" />
      <Skeleton variant="text" height="14px" className="w-2/3" />
    </div>
  );
}

interface SkeletonVerseCardProps {
  className?: string;
}

export function SkeletonVerseCard({ className }: SkeletonVerseCardProps) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="44px" height="44px" />
        <Skeleton variant="text" height="14px" className="w-20" />
      </div>
      <Skeleton variant="text" height="28px" className="w-full" />
      <Skeleton variant="text" height="28px" className="w-4/5" />
      <Skeleton variant="text" height="16px" className="w-1/2" />
    </div>
  );
}
