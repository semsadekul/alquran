'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from './Card';
import { getSurah } from '@/lib/data/quran';
import { formatCount } from '@/lib/format';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ShareIcon, RepeatIcon } from './Icon';
import { ShareAyahModal, type ShareAyahData } from './ShareAyahModal';

interface AyahRef {
  surah: number;
  ayah: number;
}

interface CorpusAyah {
  number: number;
  arabic: string;
  bangla: string;
  english: string;
}

interface CorpusPayload {
  ayahs?: CorpusAyah[];
}

/**
 * Curated references only — the text itself is always read from the verified
 * corpus (public/data/verses), never typed into the source.
 */
const DAILY_AYAH_REFS: AyahRef[] = [
  { surah: 94, ayah: 5 },
  { surah: 94, ayah: 6 },
  { surah: 65, ayah: 3 },
  { surah: 2, ayah: 153 },
  { surah: 57, ayah: 4 },
  { surah: 2, ayah: 250 },
];

const corpusCache = new Map<number, Promise<CorpusPayload>>();

function loadSurahVerses(surah: number): Promise<CorpusPayload> {
  const cached = corpusCache.get(surah);
  if (cached) return cached;
  const request = fetch(`/data/verses/${surah}.json`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<CorpusPayload>;
  });
  corpusCache.set(surah, request);
  return request;
}

export function DailyAyah() {
  const intl = useIntl();
  const { locale } = useLocale();
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [ayah, setAyah] = useState<CorpusAyah | null>(null);
  const [failed, setFailed] = useState(false);
  const [shareCard, setShareCard] = useState<ShareAyahData | null>(null);

  useEffect(() => {
    setMounted(true);
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    setIndex(dayOfYear % DAILY_AYAH_REFS.length);
  }, []);

  const ref = DAILY_AYAH_REFS[index];
  const surahMeta = ref ? getSurah(ref.surah) : undefined;

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    setAyah(null);
    setFailed(false);

    loadSurahVerses(ref.surah)
      .then((payload) => {
        if (cancelled) return;
        const found = payload.ayahs?.find((item) => item.number === ref.ayah);
        if (found) setAyah(found);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ref]);

  if (!mounted || !ref) return null;

  const surahName = surahMeta?.englishName ?? `Surah ${ref.surah}`;
  const reference = `${surahName} · ${formatCount(ref.surah, locale)}:${formatCount(ref.ayah, locale)}`;

  const handleShare = () => {
    if (!ayah || !surahMeta) return;
    setShareCard({
      surahName: surahMeta.name,
      surahEnglishName: surahMeta.englishName,
      surahNumber: ref.surah,
      verseNumber: ref.ayah,
      arabic: ayah.arabic,
      bangla: ayah.bangla,
      english: ayah.english,
    });
  };

  return (
    <>
      <Card className="rounded-card border-gold-line bg-surface px-5 pt-[18px] pb-2 animate-slide-up">
        <p className="text-[12px] font-semibold tracking-[0.12em] text-gold-dark">
          {intl.formatMessage({ id: 'home.dailyAyah.label' })}
        </p>

        {ayah ? (
          <>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-[30px] leading-[1.7] text-center text-text mt-2"
            >
              {ayah.arabic}
            </p>

            <p className="bangla-display text-[15px] leading-[1.7] text-center text-text-muted mt-1">
              {ayah.bangla}
            </p>

            <p lang="en" className="text-[13px] italic text-center text-ink-4 mt-1.5">
              &quot;{ayah.english}&quot;
            </p>
          </>
        ) : (
          <p className="text-[15px] text-text-muted py-6 text-center">
            {failed
              ? intl.formatMessage({ id: 'home.dailyAyah.error' })
              : intl.formatMessage({ id: 'home.dailyAyah.loading' })}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-[13px] font-medium text-gold-dark">{reference}</span>
          <div className="flex items-center">
            <Link
              href={`/quran/surahs/${ref.surah}`}
              className="w-11 h-11 rounded-full flex items-center justify-center text-gold-dark hover:bg-gold-veil transition-colors"
              aria-label={intl.formatMessage({ id: 'dailyAyah.readMore' })}
            >
              <BookOpenLinkIcon />
            </Link>
            <button
              type="button"
              onClick={handleShare}
              disabled={!ayah}
              className="w-11 h-11 rounded-full flex items-center justify-center text-gold-dark hover:bg-gold-veil transition-colors disabled:opacity-40"
              aria-label={intl.formatMessage({ id: 'dailyAyah.share' })}
            >
              <ShareIcon width={22} height={22} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % DAILY_AYAH_REFS.length)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-gold-dark hover:bg-gold-veil transition-colors"
              aria-label={intl.formatMessage({ id: 'dailyAyah.another' })}
            >
              <RepeatIcon width={22} height={22} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </Card>

      <ShareAyahModal
        isOpen={shareCard !== null}
        data={shareCard}
        onClose={() => setShareCard(null)}
      />
    </>
  );
}

/** Local book glyph so the read action echoes the card's reference, not a nav icon. */
function BookOpenLinkIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 6.5C10.5 5.3 8.5 5 5 5v13c3.5 0 5.5.3 7 1.5 1.5-1.2 3.5-1.5 7-1.5V5c-3.5 0-5.5.3-7 1.5zM12 6.5v13" />
    </svg>
  );
}
