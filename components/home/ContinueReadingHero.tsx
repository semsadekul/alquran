'use client';

import Link from 'next/link';
import { useIntl } from 'react-intl';
import { useLocale } from '@/components/providers/LocaleProvider';
import { formatCount } from '@/lib/format';
import { PlayIcon } from '@/components/ui/Icon';

export interface ContinueSurah {
  number: number;
  /** Arabic name, as stored in the surah metadata. */
  name: string;
  englishName: string;
  banglaName?: string;
  numberOfAyahs: number;
}

interface ContinueReadingHeroProps {
  surah?: ContinueSurah | null;
  /** Last ayah read in this surah, when known. */
  lastAyah?: number;
}

/** Fallback when the reader has no history yet: start at Al-Fatiha. */
const START_SURAH: ContinueSurah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatiha',
  banglaName: 'আল-ফাতিহা',
  numberOfAyahs: 7,
};

/**
 * Deep-forest "continue reading" card: Arabic surah name, reading progress and
 * the two primary actions. The only high-emphasis block on the home screen.
 */
export function ContinueReadingHero({ surah, lastAyah }: ContinueReadingHeroProps) {
  const intl = useIntl();
  const { locale } = useLocale();

  const isContinuation = Boolean(surah);
  const current = surah ?? START_SURAH;
  const ayah = lastAyah && lastAyah > 0 ? lastAyah : isContinuation ? 1 : 1;
  const progress = Math.min(
    100,
    Math.max(2, Math.round((ayah / Math.max(current.numberOfAyahs, 1)) * 100))
  );
  const href = `/quran/surahs/${current.number}`;

  const title = isContinuation
    ? intl.formatMessage({ id: 'home.hero.continue' })
    : intl.formatMessage({ id: 'home.hero.start' });

  return (
    <section
      className="relative overflow-hidden rounded-card-lg border border-gold-line-strong bg-forest text-forest-ink p-5 sm:p-6 animate-slide-up"
      aria-label={title}
    >
      {/* Geometric watermark — a rotated square pair, held at very low opacity */}
      <svg
        width="220"
        height="220"
        viewBox="0 0 40 40"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1"
        aria-hidden="true"
        className="absolute -right-16 -top-14 opacity-[0.14] pointer-events-none"
      >
        <rect x="9" y="9" width="22" height="22" rx="2" />
        <rect x="9" y="9" width="22" height="22" rx="2" transform="rotate(45 20 20)" />
      </svg>

      <div className="relative">
        <p className="text-[12px] font-semibold tracking-[0.12em] text-gold">{title}</p>

        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-[34px] leading-[1.5] text-gold mt-2.5"
        >
          {current.name}
        </p>

        <p className="text-[15px] text-forest-ink mt-0.5">
          <span className="bangla-ui">{current.banglaName ?? current.englishName}</span>
          {' · '}
          {intl.formatMessage(
            { id: 'home.hero.ayah' },
            { number: formatCount(ayah, locale) }
          )}
        </p>

        <div
          className="mt-3.5 h-[3px] rounded-full bg-white/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label={intl.formatMessage({ id: 'home.hero.progress' })}
        >
          <div className="h-[3px] rounded-full bg-gold" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex gap-2.5 mt-4">
          <Link
            href={href}
            className="flex-1 h-12 rounded-full bg-gold text-forest font-bold text-[15px] inline-flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
          >
            <PlayIcon width={18} height={18} className="fill-current" />
            {intl.formatMessage({ id: 'home.hero.listen' })}
          </Link>
          <Link
            href={href}
            className="flex-1 h-12 rounded-full border border-gold-line-strong text-gold font-semibold text-[15px] inline-flex items-center justify-center hover:bg-gold-veil transition-colors"
          >
            {intl.formatMessage({ id: 'home.hero.read' })}
          </Link>
        </div>
      </div>
    </section>
  );
}
