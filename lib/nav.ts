import {
  HomeIcon,
  BookOpenIcon,
  HadithBookIcon,
  StarIcon,
  HandHeartIcon,
  BarChartIcon,
  SettingsIcon,
  SearchIcon,
  MoreHorizontalIcon,
} from '@/components/ui/Icon';

/**
 * Single source of truth for primary navigation.
 * Desktop sidebar AND mobile bottom nav both read from this list.
 *
 * Order matters: it determines both visual order and the active-route
 * matching precedence (later entries win on shared prefixes).
 */
export interface NavItem {
  /** Display key (matches NAV_ICONS map). */
  key: 'Home' | 'Surah' | 'Hadith' | 'Search' | 'Hifz' | 'Duas' | 'Stats' | 'Settings' | 'More';
  href: string;
  label: string;
  bengali: string;
  /** Subtle section accent, used as a tiny inline indicator. */
  accent?: 'gold' | 'green' | 'rose' | 'purple' | 'amber' | 'cyan';
  /** If true, shown in the mobile bottom bar (primary 5). Stats/Settings live in the profile menu. */
  mobilePrimary?: boolean;
  /** Short description used in the sidebar hover/tooltip. */
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'Home',
    href: '/',
    label: 'Home',
    bengali: 'হোম',
    accent: 'gold',
    mobilePrimary: true,
    description: 'Your daily reading snapshot',
  },
  {
    key: 'Surah',
    href: '/quran/library',
    label: 'Surah',
    bengali: 'সূরা',
    accent: 'green',
    mobilePrimary: true,
    description: 'Browse all 114 chapters',
  },
  {
    key: 'Hadith',
    href: '/hadith',
    label: 'Hadith',
    bengali: 'হাদীস',
    accent: 'amber',
    description: '36,390 Prophetic traditions',
  },
  {
    key: 'Search',
    href: '/search',
    label: 'Search',
    bengali: 'খুঁজুন',
    accent: 'purple',
    mobilePrimary: true,
    description: 'Find an ayah, surah or reference',
  },
  {
    key: 'Hifz',
    href: '/quran/hifz',
    label: 'Hifz',
    bengali: 'হিফজ',
    accent: 'rose',
    mobilePrimary: true,
    description: 'Memorization & revision',
  },
  {
    key: 'Duas',
    href: '/duas',
    label: 'Duas',
    bengali: 'দোয়া',
    accent: 'amber',
    description: 'Daily supplications',
  },
  {
    key: 'Stats',
    href: '/stats',
    label: 'Stats',
    bengali: 'পরিসংখ্যান',
    accent: 'cyan',
    description: 'Reading insights & streaks',
  },
  {
    key: 'Settings',
    href: '/settings',
    label: 'Settings',
    bengali: 'সেটিংস',
    description: 'Theme, language, data',
  },
  {
    key: 'More',
    href: '/more',
    label: 'More',
    bengali: 'আরও',
    accent: 'cyan',
    mobilePrimary: true,
    description: 'Duas, stats, settings and credits',
  },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobilePrimary);

/** Lookup map: section key → SVG icon component. */
export const SECTION_ICONS = {
  Home: HomeIcon,
  Surah: BookOpenIcon,
  Hadith: HadithBookIcon,
  Search: SearchIcon,
  Hifz: StarIcon,
  Duas: HandHeartIcon,
  Stats: BarChartIcon,
  Settings: SettingsIcon,
  More: MoreHorizontalIcon,
} as const;
