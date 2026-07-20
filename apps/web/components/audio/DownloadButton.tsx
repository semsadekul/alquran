'use client';

import { useCallback } from 'react';
import { Download, Check, Pause, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import type { SurahAudioRecord } from '@/lib/audio/types';
import { cn } from '@/lib/cn';

interface DownloadButtonProps {
  record?: SurahAudioRecord;
  onDownload: () => void;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  className?: string;
}

export function DownloadButton({
  record,
  onDownload,
  onPause,
  onResume,
  onDelete,
  className,
}: DownloadButtonProps) {
  const status = record?.status ?? 'none';
  const progress =
    record && record.totalAyahs > 0
      ? Math.round((record.downloadedAyahs / record.totalAyahs) * 100)
      : 0;

  const handleClick = useCallback(() => {
    switch (status) {
      case 'none':
      case 'error':
        onDownload();
        break;
      case 'downloading':
        onPause();
        break;
      case 'paused':
        onResume();
        break;
      case 'complete':
        onDelete();
        break;
    }
  }, [status, onDownload, onPause, onResume, onDelete]);

  if (status === 'complete') {
    return (
      <IconButton
        ariaLabel="Downloaded — tap to delete"
        onClick={handleClick}
        className={cn('text-gold', className)}
      >
        <Check size={18} />
      </IconButton>
    );
  }

  if (status === 'downloading') {
    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22" cy="22" r="18"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <circle
            cx="22" cy="22" r="18"
            fill="none"
            stroke="var(--warm)"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <button
          type="button"
          onClick={handleClick}
          className="absolute inset-0 flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px]"
          aria-label={`Downloading ${progress}% — tap to pause`}
        >
          <span className="text-[10px] font-bold text-ink">{progress}%</span>
        </button>
      </div>
    );
  }

  if (status === 'paused') {
    return (
      <IconButton
        ariaLabel={`Paused at ${progress}% — tap to resume`}
        onClick={handleClick}
        className={cn('text-ink-3', className)}
      >
        <RotateCcw size={18} />
      </IconButton>
    );
  }

  if (status === 'queued') {
    return (
      <IconButton ariaLabel="Queued" disabled className={className}>
        <Loader2 size={18} className="animate-spin" />
      </IconButton>
    );
  }

  if (status === 'error') {
    return (
      <IconButton
        ariaLabel={record?.errorMessage ?? 'Error — tap to retry'}
        onClick={handleClick}
        className={cn('text-red-500', className)}
      >
        <AlertCircle size={18} />
      </IconButton>
    );
  }

  // Default: none
  return (
    <IconButton
      ariaLabel="Download"
      onClick={handleClick}
      className={className}
    >
      <Download size={18} />
    </IconButton>
  );
}
