'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDownloads } from '@/components/audio/useDownloads';
import { DownloadButton } from '@/components/audio/DownloadButton';
import { Search, Wifi, HardDrive, Download, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SurahAudioRecord } from '@/lib/audio/types';

// Surah metadata for display
const SURAH_NAMES: Record<number, { en: string; bn: string; ayahs: number }> = {};
function getSurahMeta(surah: number) {
  return SURAH_NAMES[surah] ?? { en: `Surah ${surah}`, bn: `সূরা ${surah}`, ayahs: 0 };
}

export default function OfflinePage() {
  const { records, getRecord, completedCount, totalDownloadedBytes, manager } = useDownloads();
  const [search, setSearch] = useState('');
  const [wifiOnly, setWifiOnly] = useState(true);
  const reciterId = 'Alafasy_128kbps';

  // Build surah list (1-114)
  const surahs = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 114; i++) {
      const record = getRecord(reciterId, i);
      list.push({ number: i, record });
    }
    return list;
  }, [getRecord, records]);

  const filteredSurahs = useMemo(() => {
    if (!search) return surahs;
    const q = search.toLowerCase();
    return surahs.filter((s) => {
      const meta = getSurahMeta(s.number);
      return (
        s.number.toString().includes(q) ||
        meta.en.toLowerCase().includes(q) ||
        meta.bn.includes(q)
      );
    });
  }, [surahs, search]);

  const isAnyDownloading = records.some((r) => r.status === 'downloading' || r.status === 'queued');
  const totalSizeMB = (totalDownloadedBytes / (1024 * 1024)).toFixed(1);

  const handleDownloadAll = useCallback(() => {
    manager.setWifiOnly(wifiOnly);
    // Enqueue all 114 surahs
    for (let i = 1; i <= 114; i++) {
      manager.enqueueSurah(reciterId, i, 114); // Default ayah count, will be corrected
    }
  }, [manager, wifiOnly, reciterId]);

  const handlePauseAll = useCallback(() => {
    for (const r of records) {
      if (r.status === 'downloading' || r.status === 'queued') {
        manager.pause(r.key);
      }
    }
  }, [manager, records]);

  const handleResumeAll = useCallback(() => {
    for (const r of records) {
      if (r.status === 'paused') {
        manager.resume(r.key);
      }
    }
  }, [manager, records]);

  return (
    <PageShell
      title="Offline Audio"
      eyebrow="Offline"
      lede="Download Quran recitations for offline listening. One reciter at launch (Mishary Alafasy, 128 kbps)."
    >
      {/* Stats + Download All */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-ink">{completedCount}</div>
          <div className="text-sm text-ink-3">of 114 surahs downloaded</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-ink">
            <HardDrive size={24} className="text-accent" />
            {totalSizeMB} MB
          </div>
          <div className="text-sm text-ink-3">Storage used</div>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-2">
          <div className="flex gap-2 w-full">
            {!isAnyDownloading ? (
              <Button variant="gold" className="flex-1" onClick={handleDownloadAll}>
                <Download size={16} />
                Download All
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="flex-1" onClick={handlePauseAll}>
                  <Pause size={16} />
                  Pause All
                </Button>
              </>
            )}
          </div>
          {completedCount < 114 && records.some((r) => r.status === 'paused') && (
            <Button variant="ghost" size="sm" className="w-full" onClick={handleResumeAll}>
              <Play size={14} />
              Resume All
            </Button>
          )}
        </Card>
      </div>

      {/* Wi-Fi only toggle */}
      <Card className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wifi size={18} className="text-ink-3" />
          <span className="text-sm text-ink">Download only on Wi-Fi</span>
        </div>
        <Toggle
          checked={wifiOnly}
          onChange={(v) => {
            setWifiOnly(v);
            manager.setWifiOnly(v);
          }}
        />
      </Card>

      {/* Search */}
      <div className="flex items-center bg-surface border border-line rounded-full px-4 py-2 mb-4 focus-within:border-[var(--border-focus)] transition-colors">
        <Search size={18} className="text-ink-3 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search surah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-ink text-sm min-w-0"
        />
      </div>

      {/* Surah list */}
      <div className="space-y-2">
        {filteredSurahs.map(({ number, record }) => (
          <SurahDownloadRow
            key={number}
            surah={number}
            record={record}
            manager={manager}
            reciterId={reciterId}
            wifiOnly={wifiOnly}
          />
        ))}
      </div>
    </PageShell>
  );
}

function SurahDownloadRow({
  surah,
  record,
  manager,
  reciterId,
  wifiOnly,
}: {
  surah: number;
  record: SurahAudioRecord | undefined;
  manager: ReturnType<typeof useDownloads>['manager'];
  reciterId: string;
  wifiOnly: boolean;
}) {
  const meta = getSurahMeta(surah);
  const status = record?.status ?? 'none';

  const handleDownload = useCallback(() => {
    manager.setWifiOnly(wifiOnly);
    manager.enqueueSurah(reciterId, surah, meta.ayahs || 286);
  }, [manager, wifiOnly, reciterId, surah, meta.ayahs]);

  const handlePause = useCallback(() => {
    const key = `${reciterId}:${surah}`;
    manager.pause(key);
  }, [manager, reciterId, surah]);

  const handleResume = useCallback(() => {
    const key = `${reciterId}:${surah}`;
    manager.resume(key);
  }, [manager, reciterId, surah]);

  const handleDelete = useCallback(() => {
    manager.deleteSurah(reciterId, surah);
  }, [manager, reciterId, surah]);

  return (
    <Card
      className={cn(
        'flex items-center gap-3',
        status === 'complete' && 'border-gold/30',
      )}
    >
      {/* Surah number */}
      <div className="w-9 h-9 bg-[var(--surface-muted)] text-ink-2 flex items-center justify-center rounded-lg font-semibold text-xs shrink-0">
        {surah}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink text-sm truncate">{meta.en}</span>
          {status === 'complete' && <Badge tone="gold">Downloaded</Badge>}
          {status === 'error' && (
            <Badge tone="danger">{record?.errorMessage ?? 'Error'}</Badge>
          )}
        </div>
        <div className="text-xs text-ink-3">
          {meta.bn} · {meta.ayahs || '...'} Ayahs
          {record && record.bytes > 0 && status === 'complete' && (
            <span> · {(record.bytes / (1024 * 1024)).toFixed(1)} MB</span>
          )}
          {status === 'downloading' && record && (
            <span> · {Math.round((record.downloadedAyahs / record.totalAyahs) * 100)}%</span>
          )}
          {status === 'paused' && record && (
            <span> · Paused at {Math.round((record.downloadedAyahs / record.totalAyahs) * 100)}%</span>
          )}
        </div>
      </div>

      {/* Download button */}
      <DownloadButton
        record={record}
        onDownload={handleDownload}
        onPause={handlePause}
        onResume={handleResume}
        onDelete={handleDelete}
      />
    </Card>
  );
}
