'use client';

import Link from 'next/link';
import { useIntl } from 'react-intl';
import { BookOpenIcon, HandHeartIcon, StarIcon, BarChartIcon } from '@/components/ui/Icon';

const TILES = [
  { href: '/quran/library', labelId: 'home.tile.surah', Icon: BookOpenIcon },
  { href: '/duas', labelId: 'home.tile.duas', Icon: HandHeartIcon },
  { href: '/quran/hifz', labelId: 'home.tile.hifz', Icon: StarIcon },
  { href: '/stats', labelId: 'home.tile.stats', Icon: BarChartIcon },
] as const;

/** Four primary destinations, 76px tall, icon over label. */
export function ShortcutTiles() {
  const intl = useIntl();

  return (
    <nav aria-label={intl.formatMessage({ id: 'home.tiles.label' })} className="grid grid-cols-4 gap-2.5">
      {TILES.map(({ href, labelId, Icon }) => (
        <Link
          key={href}
          href={href}
          className="h-[76px] rounded-tile border border-gold-line bg-surface text-gold-dark flex flex-col items-center justify-center gap-1.5 px-1 transition-colors hover:bg-surface-highlight hover:border-gold-line-strong"
        >
          <Icon width={24} height={24} strokeWidth={1.75} />
          <span className="text-[13px] font-medium text-text text-center leading-tight">
            {intl.formatMessage({ id: labelId })}
          </span>
        </Link>
      ))}
    </nav>
  );
}
