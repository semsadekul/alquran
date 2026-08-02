import {
  HomeIcon,
  BookOpenIcon,
  StarIcon,
  HandHeartIcon,
  BarChartIcon,
  SettingsIcon,
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
  key: 'Home' | 'Surah' | 'Hifz' | 'Duas' | 'Stats' | 'Settings';
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
    mobilePrimary: true,
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
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobilePrimary);

/** Lookup map: section key → SVG icon component. */
export const SECTION_ICONS = {
  Home: HomeIcon,
  Surah: BookOpenIcon,
  Hifz: StarIcon,
  Duas: HandHeartIcon,
  Stats: BarChartIcon,
  Settings: SettingsIcon,
} as const;
