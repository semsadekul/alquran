# Al Quran — Complete Implementation Guide

> **Scope**: Pure Quran-only application. No Hadith. No AI.
> **Goal**: Become the best Quran app in Bangladesh — for both web and Android.
> **Root**: `C:\Users\Sadek\Downloads\Al_Quran`
>
> This guide is written so that **any AI agent** can read it top-to-bottom and
> build every feature without ambiguity. Each section has exact file paths,
> code patterns, design specs, and verification steps.

---

## Table of Contents

1. [Project Vision and Positioning](#1-project-vision-and-positioning)
2. [Scope Decision — What to Remove](#2-scope-decision--what-to-remove)
3. [Architecture Overview](#3-architecture-overview)
4. [Monorepo Cleanup and Restructuring](#4-monorepo-cleanup-and-restructuring)
5. [Design System — Colors, Typography, Tokens](#5-design-system--colors-typography-tokens)
6. [Motion Graphics and Animation System](#6-motion-graphics-and-animation-system)
7. [Responsive Typography System](#7-responsive-typography-system)
8. [Phase 1 — Foundation Shell and Navigation](#8-phase-1--foundation-shell-and-navigation)
9. [Phase 2 — Homepage (Web)](#9-phase-2--homepage-web)
10. [Phase 3 — Quran Home Page](#10-phase-3--quran-home-page)
11. [Phase 4 — Surah List Page](#11-phase-4--surah-list-page)
12. [Phase 5 — Surah Reader (Premium)](#12-phase-5--surah-reader-premium)
13. [Phase 6 — Audio System Redesign](#13-phase-6--audio-system-redesign)
14. [Phase 7 — Hifz Memorization Mode](#14-phase-7--hifz-memorization-mode)
15. [Phase 8 — Search System](#15-phase-8--search-system)
16. [Phase 9 — Bookmarks, Last Read, Library](#16-phase-9--bookmarks-last-read-library)
17. [Phase 10 — Settings and Preferences](#17-phase-10--settings-and-preferences)
18. [Phase 11 — Offline PWA](#18-phase-11--offline-pwa)
19. [Phase 12 — Dark Mode and Light Mode](#19-phase-12--dark-mode-and-light-mode)
20. [Phase 13 — Android App (React Native)](#20-phase-13--android-app-react-native)
21. [Phase 14 — Android Widgets](#21-phase-14--android-widgets)
22. [Phase 15 — SEO and Metadata](#22-phase-15--seo-and-metadata)
23. [Phase 16 — Performance Optimization](#23-phase-16--performance-optimization)
24. [Phase 17 — Accessibility](#24-phase-17--accessibility)
25. [Phase 18 — Deployment](#25-phase-18--deployment)
26. [Loopholes and Bug Fixes in Current Code](#26-loopholes-and-bug-fixes-in-current-code)
27. [File-by-File Change Manifest](#27-file-by-file-change-manifest)
28. [Verification Checklist](#28-verification-checklist)

---

## 1. Project Vision and Positioning

**One-line vision**: The most beautiful, reliable, and deeply usable Bangla Quran reading and memorization platform — on web and Android.

**Product pillars**:
1. **Sacred Reading First** — Arabic text is king. Every pixel serves readability.
2. **Bangla-Native Excellence** — Not a translated English app. Bangla is first-class.
3. **Offline Reliability** — Core Quran reading works with zero internet.
4. **Listening and Memorization** — Audio recitation and Hifz are core, not add-ons.
5. **Premium Feel** — Users should feel this is the highest-quality Quran app they have used.

**Benchmark products** (for quality standard, not feature copying):
- `Quran.com` — reading clarity
- `Spotify` — audio player UX and continuity
- `Linear` — compositional discipline, focused interface
- `Apple Books` — calm reading experience
- `Material You` — Android native feel

---

## 2. Scope Decision — What to Remove

### DELETE these files and references

**Hadith package** — `packages/hadith/` (entire directory)
- Delete `packages/hadith/src/index.ts`
- Delete `packages/hadith/package.json`
- Delete `packages/hadith/tsconfig.json`

**Hadith web pages** — `apps/web/app/hadith/` (entire directory)
- Delete `apps/web/app/hadith/page.tsx`
- Delete `apps/web/app/hadith/collections/` (entire subdirectory)

**AI web page** — `apps/web/app/ai/` (entire directory)
- Delete `apps/web/app/ai/page.tsx`

**API Hadith module** — `apps/api/src/hadith/` (entire directory)
**API AI module** — `apps/api/src/ai/` (entire directory)

**Mobile Hadith screen** — `apps/mobile/src/screens/HadithScreen.tsx`

### UPDATE these files to remove Hadith and AI references

**`apps/web/app/layout.tsx`** — Remove `Hadith` and `AI` from `topLinks` array.

**`apps/web/app/page.tsx`** — Remove `Hadith` and `AI` from `domains` array.

**`apps/web/package.json`** — Remove `"@alquran/hadith": "workspace:*"` from dependencies.

**`apps/mobile/package.json`** — Remove `"@alquran/hadith": "workspace:*"` from dependencies.

**`apps/mobile/src/navigation/BottomTabNavigator.tsx`** — Remove `HadithScreen` import and `Hadith` tab.

**`apps/mobile/src/screens/HomeScreen.tsx`** — Remove Hadith from the `domains` array.

**`apps/api/src/app.module.ts`** — Remove `HadithModule` and `AiModule` imports.

**`apps/web/app/globals.css`** — Remove all `.ai-*` CSS classes (lines 830-953). Remove `.card-badge.badge-coming` and hadith-specific card styles.

**`pnpm-workspace.yaml`** — Keep `packages/hadith` in the workspace file until deletion; after deleting the directory, remove it.

### After deletion, the navigation becomes

**Web**: Home, Quran, Hifz, Search, Library, Offline, Settings
**Android**: Home, Quran, Search, Library (4-tab bottom nav)

---

## 3. Architecture Overview

```
Al_Quran/
├── apps/
│   ├── web/              ← Next.js 15 (App Router, static export)
│   │   ├── app/          ← Pages and routes
│   │   ├── components/   ← React components
│   │   ├── lib/          ← Data loading, utilities
│   │   └── public/       ← Static assets (icons, images, fonts)
│   ├── mobile/           ← React Native + Expo (Android)
│   │   └── src/
│   │       ├── screens/
│   │       ├── components/
│   │       ├── navigation/
│   │       ├── hooks/
│   │       └── widgets/
│   └── api/              ← NestJS (future sync/auth, not MVP-critical)
├── packages/
│   ├── quran/            ← Shared Quran domain logic
│   ├── tokens/           ← Design tokens (colors, spacing, radius, typography)
│   ├── types/            ← Shared TypeScript types
│   ├── config/           ← Shared ESLint/TS configs
│   └── search/           ← Search indexing utilities
├── data/                 ← Static JSON data files
├── www/                  ← Legacy PWA (preserved for reference/offline)
└── IMPLEMENTATION_GUIDE.md  ← This file
```

**Tech stack**:
- **Web**: Next.js 15, React 19, TypeScript, Vanilla CSS with CSS custom properties
- **Android**: React Native 0.76, Expo ~52, TypeScript, React Navigation 7
- **Shared**: pnpm workspaces + Turborepo
- **Fonts**: Inter (UI), Noto Naskh Arabic (Arabic reading), Noto Serif Bengali (Bangla reading), Hind Siliguri (Bangla UI labels)
- **Icons**: Lucide React (web), Material Symbols (Android)
- **Audio**: HTML5 Audio API (web), expo-av (Android)

---

## 4. Monorepo Cleanup and Restructuring

### Step 4.1 — Fix existing build errors

**File**: `apps/api/src/library/library.service.ts` line 46

```diff
-    const results = [];
+    // eslint-disable-next-line @typescript-eslint/no-explicit-any
+    const results: any[] = [];
```

**File**: `apps/web/next.config.ts` — Enable static export

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
```

**File**: `turbo.json` — Add `out/**` to build outputs

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "out/**"]
    },
    "lint": { "dependsOn": ["^lint"] },
    "typecheck": { "dependsOn": ["^typecheck"] }
  }
}
```

### Step 4.2 — Update packages/tokens with complete design system

**File**: `packages/tokens/src/index.ts`

Replace entire file with the comprehensive token system defined in Section 5.

### Step 4.3 — Update packages/types

**File**: `packages/types/src/index.ts`

Add missing types for Reading Progress, Daily Verse, Audio state:

```typescript
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  banglaName?: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;          // absolute verse number across entire Quran
  surah: number;
  ayah: number;            // verse number within surah
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  banglaTransliteration?: string;
  juz?: number;
  page?: number;
  hizbQuarter?: number;
}

export interface Bookmark {
  id: string;
  surah: number;
  ayah: number;
  surahName: string;
  textPreview: string;
  timestamp: number;
}

export interface ReadingPosition {
  surah: number;
  ayah: number;
  surahName: string;
  timestamp: number;
  scrollY?: number;
}

export interface ReaderPreferences {
  theme: 'dark' | 'light' | 'system';
  arabicFontSize: number;       // px value, default 38
  banglaFontSize: number;       // px value, default 16
  englishFontSize: number;      // px value, default 15
  showArabic: boolean;
  showBangla: boolean;
  showEnglish: boolean;
  showTransliteration: boolean;
  showBanglaTransliteration: boolean;
  lineSpacing: 'compact' | 'normal' | 'spacious';
  readingMode: 'translation' | 'arabic-only' | 'study';
}

export interface AudioState {
  isPlaying: boolean;
  currentSurah: number | null;
  currentAyah: number | null;
  reciter: string;
  volume: number;
  playbackRate: number;
  repeatMode: 'none' | 'ayah' | 'range' | 'surah';
}

export interface HifzSession {
  surah: number;
  startAyah: number;
  endAyah: number;
  repeatCount: number;
  delayBetweenRepeats: number;    // milliseconds
  hiddenLayers: ('arabic' | 'bangla' | 'english' | 'transliteration')[];
  completedAyahs: number[];
}

export interface DailyVerse {
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  date: string;                    // ISO date string
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;            // ISO date string
  totalDaysRead: number;
}
```

---

## 5. Design System — Colors, Typography, Tokens

### 5.1 — Color Palette

This replaces the current emerald-gold-heavy palette with a calmer, warmer, more premium system.

**File**: `packages/tokens/src/index.ts`

```typescript
// -- Brand Colors --
export const brand = {
  moss: {
    900: '#0E3D2E',
    800: '#145438',
    700: '#1D5C4A',
    600: '#2B6E59',
    500: '#3B8369',     // Primary action color
    400: '#5AA380',
    300: '#82C4A0',
    200: '#B8DFC8',
    100: '#E2F3EA',
    50:  '#F0F9F4',
  },
  gold: {
    700: '#8B6914',
    600: '#B8891F',
    500: '#C89A2B',     // Warm accent (sparse use)
    400: '#D8B35D',
    300: '#E8CC85',
    200: '#F2E4B8',
    100: '#FAF3E0',
  },
  ink: {
    950: '#060D10',
    900: '#0B1114',     // Deepest background
    850: '#0F171B',
    800: '#121A1F',     // Surface
    750: '#162127',     // Surface muted
    700: '#1A262D',     // Surface elevated
    600: '#26343D',     // Border
    500: '#3A4D58',
    400: '#5A707D',
  },
  stone: {
    50:  '#F7F8F6',     // Light mode background
    100: '#F1F2EE',
    200: '#E2E7E3',     // Light mode border
    300: '#CED5CF',
    400: '#A8B2AB',
  },
} as const;

// -- Semantic Theme Tokens --
export const colors = {
  dark: {
    background:       '#0B1114',
    backgroundSubtle: '#0F171B',
    surface:          '#121A1F',
    surfaceMuted:     '#162127',
    surfaceElevated:  '#1A262D',
    surfaceHover:     'rgba(255, 255, 255, 0.03)',
    border:           '#26343D',
    borderSubtle:     'rgba(255, 255, 255, 0.06)',
    borderFocus:      '#3B8369',
    textPrimary:      '#F5F7F8',
    textSecondary:    '#CBD4D9',
    textMuted:        '#8D9AA2',
    textFaint:        '#5A707D',
    accent:           '#3B8369',
    accentHover:      '#5AA380',
    accentSubtle:     'rgba(59, 131, 105, 0.16)',
    accentWarm:       '#D8B35D',
    accentWarmSubtle: 'rgba(216, 179, 93, 0.12)',
    success:          '#1F8A5B',
    warning:          '#C58A1C',
    danger:           '#C64F4F',
    info:             '#2F7CC2',
    overlay:          'rgba(6, 13, 16, 0.7)',
    glass:            'rgba(11, 17, 20, 0.92)',
    arabicText:       '#EDF0F2',
    activeVerse:      'rgba(216, 179, 93, 0.06)',
    activeBorder:     'rgba(216, 179, 93, 0.28)',
  },
  light: {
    background:       '#F7F8F6',
    backgroundSubtle: '#F1F2EE',
    surface:          '#FFFFFF',
    surfaceMuted:     '#F1F3F0',
    surfaceElevated:  '#FFFFFF',
    surfaceHover:     'rgba(0, 0, 0, 0.02)',
    border:           '#E2E7E3',
    borderSubtle:     'rgba(0, 0, 0, 0.06)',
    borderFocus:      '#2B6E59',
    textPrimary:      '#11181C',
    textSecondary:    '#42515A',
    textMuted:        '#6A7780',
    textFaint:        '#95A1A8',
    accent:           '#2B6E59',
    accentHover:      '#1D5C4A',
    accentSubtle:     'rgba(43, 110, 89, 0.1)',
    accentWarm:       '#B8891F',
    accentWarmSubtle: 'rgba(184, 137, 31, 0.08)',
    success:          '#1F8A5B',
    warning:          '#C58A1C',
    danger:           '#C64F4F',
    info:             '#2F7CC2',
    overlay:          'rgba(0, 0, 0, 0.4)',
    glass:            'rgba(247, 248, 246, 0.92)',
    arabicText:       '#11181C',
    activeVerse:      'rgba(184, 137, 31, 0.06)',
    activeBorder:     'rgba(184, 137, 31, 0.2)',
  },
} as const;

// -- Spacing (4px base) --
export const spacing = {
  0:  '0px',
  0.5: '2px',
  1:  '4px',
  1.5: '6px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// -- Border Radius --
export const radius = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '24px',
  '2xl': '32px',
  full: '999px',
} as const;

// -- Shadows --
export const shadows = {
  sm:       '0 1px 2px rgba(0, 0, 0, 0.06)',
  md:       '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg:       '0 12px 32px rgba(0, 0, 0, 0.12)',
  xl:       '0 20px 60px rgba(0, 0, 0, 0.18)',
  glow:     '0 0 40px rgba(59, 131, 105, 0.12)',
  inner:    'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  audioBar: '0 -8px 32px rgba(0, 0, 0, 0.24)',
} as const;

// -- Typography Scale --
export const typography = {
  fonts: {
    sans:      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    arabic:    "'Noto Naskh Arabic', 'Traditional Arabic', serif",
    bengali:   "'Noto Serif Bengali', 'SolaimanLipi', 'Kalpurush', serif",
    bengaliUI: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
    mono:      "'JetBrains Mono', 'Fira Code', monospace",
  },
  sizes: {
    display1: { size: '48px', lineHeight: '56px', weight: 800 },
    display2: { size: '40px', lineHeight: '48px', weight: 800 },
    display3: { size: '32px', lineHeight: '40px', weight: 700 },
    h1: { size: '28px', lineHeight: '36px', weight: 700 },
    h2: { size: '24px', lineHeight: '32px', weight: 700 },
    h3: { size: '20px', lineHeight: '28px', weight: 600 },
    h4: { size: '18px', lineHeight: '26px', weight: 600 },
    bodyLg:   { size: '16px', lineHeight: '28px', weight: 400 },
    body:     { size: '15px', lineHeight: '24px', weight: 400 },
    bodySm:   { size: '14px', lineHeight: '22px', weight: 400 },
    caption:  { size: '13px', lineHeight: '20px', weight: 500 },
    label:    { size: '12px', lineHeight: '16px', weight: 700 },
    overline: { size: '11px', lineHeight: '16px', weight: 700 },
  },
  arabic: {
    reading:  { size: '38px', lineHeight: 2.2 },
    desktop:  { size: '44px', lineHeight: 2.2 },
    min:      { size: '28px', lineHeight: 2.0 },
    max:      { size: '60px', lineHeight: 2.4 },
  },
} as const;

// -- Transitions and Easings --
export const motion = {
  duration: {
    instant:  '0ms',
    fast:     '120ms',
    normal:   '200ms',
    slow:     '350ms',
    slower:   '500ms',
    entrance: '400ms',
    exit:     '250ms',
  },
  easing: {
    default:    'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce:     'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// -- Breakpoints --
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// -- Z-Index Scale --
export const zIndex = {
  base:      0,
  dropdown:  10,
  sticky:    20,
  overlay:   30,
  modal:     40,
  toast:     50,
  audioBar:  45,
  topBar:    40,
} as const;
```

### 5.2 — CSS Custom Properties

**File**: `apps/web/app/globals.css` — Top section

The globals.css file must define these tokens as CSS custom properties. Map every token to a `--` variable.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-arabic: 'Noto Naskh Arabic', serif;
  --font-bengali: 'Noto Serif Bengali', serif;
  --font-bengali-ui: 'Hind Siliguri', sans-serif;
  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-slow: 350ms;
  --duration-entrance: 400ms;
  --ease-default: cubic-bezier(0.2, 0, 0, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0, 1);
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-full: 999px;
}

/* Dark Theme (default) */
[data-theme="dark"], :root {
  color-scheme: dark;
  --bg: #0B1114;
  --bg-subtle: #0F171B;
  --surface: #121A1F;
  --surface-muted: #162127;
  --surface-elevated: #1A262D;
  --surface-hover: rgba(255, 255, 255, 0.03);
  --border: #26343D;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-focus: #3B8369;
  --text-1: #F5F7F8;
  --text-2: #CBD4D9;
  --text-3: #8D9AA2;
  --text-4: #5A707D;
  --accent: #3B8369;
  --accent-hover: #5AA380;
  --accent-subtle: rgba(59, 131, 105, 0.16);
  --warm: #D8B35D;
  --warm-subtle: rgba(216, 179, 93, 0.12);
  --glass: rgba(11, 17, 20, 0.92);
  --overlay: rgba(6, 13, 16, 0.7);
  --arabic-text: #EDF0F2;
  --active-verse-bg: rgba(216, 179, 93, 0.06);
  --active-verse-border: rgba(216, 179, 93, 0.28);
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-elevated: 0 12px 32px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 0 40px rgba(59, 131, 105, 0.12);
}

/* Light Theme */
[data-theme="light"] {
  color-scheme: light;
  --bg: #F7F8F6;
  --bg-subtle: #F1F2EE;
  --surface: #FFFFFF;
  --surface-muted: #F1F3F0;
  --surface-elevated: #FFFFFF;
  --surface-hover: rgba(0, 0, 0, 0.02);
  --border: #E2E7E3;
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-focus: #2B6E59;
  --text-1: #11181C;
  --text-2: #42515A;
  --text-3: #6A7780;
  --text-4: #95A1A8;
  --accent: #2B6E59;
  --accent-hover: #1D5C4A;
  --accent-subtle: rgba(43, 110, 89, 0.1);
  --warm: #B8891F;
  --warm-subtle: rgba(184, 137, 31, 0.08);
  --glass: rgba(247, 248, 246, 0.92);
  --overlay: rgba(0, 0, 0, 0.4);
  --arabic-text: #11181C;
  --active-verse-bg: rgba(184, 137, 31, 0.06);
  --active-verse-border: rgba(184, 137, 31, 0.2);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 0 32px rgba(43, 110, 89, 0.08);
}
```

---

## 6. Motion Graphics and Animation System

### Allowed Animations (where to use motion)

| Surface | Animation | CSS/Method | Duration |
|---------|-----------|------------|----------|
| Page transition | Fade + subtle slide up | opacity 0 to 1, translateY(12px to 0) | 400ms ease-decelerate |
| Card hover | Lift + border glow | translateY(-2px), border-color transition, box-shadow glow | 200ms |
| Verse highlight | Warm glow pulse when audio plays | background-color transition + subtle left-border scale | 350ms |
| Audio bar entrance | Slide up from bottom | translateY(100%) to translateY(0) | 400ms spring |
| Bottom sheet (mobile) | Slide up with backdrop fade | translateY + opacity on backdrop | 350ms decelerate |
| Search results | Staggered fade-in | Each result delays index * 40ms | 300ms per item |
| Surah list row hover | Background fill + slight scale | background transition + scale(1.005) | 180ms |
| Skeleton loading | Shimmer gradient sweep | @keyframes shimmer with gradient translateX | 1.5s infinite |
| Bookmark add | Scale bounce | scale(0.8 to 1.1 to 1) with spring easing | 400ms |
| Toggle switch | Smooth slide | transform translateX | 200ms |
| Arabic text entrance | Fade in from right (RTL context) | opacity 0 to 1, translateX(8px to 0) | 300ms decelerate |
| Scroll progress | Top bar width animation | width transition on scroll listener | instant tracking |

### Forbidden Animations

- **NO** ambient floating particles on reading pages
- **NO** continuous parallax effects
- **NO** decorative pulsing orbs or gradient blobs near Quran text
- **NO** aggressive glow/neon effects
- **NO** bounce animations on text content
- **NO** animations longer than 500ms except page transitions

### Implementation Pattern

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

@keyframes versePulse {
  0%, 100% { border-left-color: var(--warm); }
  50% { border-left-color: rgba(216, 179, 93, 0.5); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

.page-enter {
  animation: fadeSlideUp var(--duration-entrance) var(--ease-decelerate) both;
}

.skeleton {
  background: linear-gradient(90deg, var(--surface-muted) 0px, var(--surface-elevated) 40px, var(--surface-muted) 80px);
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.verse-card-active {
  background: var(--active-verse-bg);
  border-left: 3px solid var(--warm);
  animation: versePulse 2s ease-in-out infinite;
}
```

---

## 7. Responsive Typography System

### Arabic Text Scaling

```css
.verse-arabic {
  font-family: var(--font-arabic);
  font-size: clamp(1.75rem, 4vw + 0.5rem, 3.5rem);
  line-height: 2.2;
  direction: rtl;
  text-align: right;
  color: var(--arabic-text);
  word-spacing: 4px;
  letter-spacing: 0.02em;
}
```

### Bangla Text Scaling

```css
.verse-bangla {
  font-family: var(--font-bengali);
  font-size: clamp(0.9rem, 1.5vw + 0.4rem, 1.15rem);
  line-height: 1.9;
  color: var(--text-2);
}
```

### English Text Scaling

```css
.verse-english {
  font-size: clamp(0.85rem, 1.2vw + 0.3rem, 1.05rem);
  line-height: 1.8;
  color: var(--text-2);
}
```

### User-Adjustable Font Size (via CSS Variables)

```css
.reader-content {
  --arabic-size-multiplier: 1;
  --translation-size-multiplier: 1;
}

.reader-content .verse-arabic {
  font-size: calc(clamp(1.75rem, 4vw + 0.5rem, 3.5rem) * var(--arabic-size-multiplier));
}

.reader-content .verse-bangla,
.reader-content .verse-english {
  font-size: calc(clamp(0.9rem, 1.5vw + 0.4rem, 1.15rem) * var(--translation-size-multiplier));
}
```

### Heading Typography

```css
h1 { font-size: clamp(1.6rem, 3.5vw + 0.5rem, 2.5rem); line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; }
h2 { font-size: clamp(1.2rem, 2vw + 0.3rem, 1.5rem); line-height: 1.25; font-weight: 700; }
h3 { font-size: clamp(1rem, 1.5vw + 0.2rem, 1.25rem); line-height: 1.3; font-weight: 600; }
```

---

## 8. Phase 1 — Foundation Shell and Navigation

### Web Shell

**File**: `apps/web/app/layout.tsx`

The shell needs:

1. **Topbar**: Sticky, 56px height, blur backdrop, no decorative elements.
2. **Brand**: Simple text + Islamic crescent icon. No large logos.
3. **Navigation links**: Home, Quran, Hifz, Search, Library, Settings — with Bangla labels.
4. **Mobile nav**: Hamburger button that opens a slide-in overlay with Bangla labels.
5. **Footer**: Minimal. One line. Bangla-first.
6. **Scroll progress bar**: Thin 2px bar at the very top of viewport showing reading progress.
7. **Back-to-top button**: Appears after scrolling 400px. Circular, bottom-right, fade-in.
8. **`lang="bn"`** on the html element for Bangla-first.

### Navigation Links (After Hadith/AI Removal)

```typescript
const navLinks = [
  { label: 'হোম', href: '/' },
  { label: 'কুরআন', href: '/quran' },
  { label: 'হিফয', href: '/hifz' },
  { label: 'খুঁজুন', href: '/search' },
  { label: 'লাইব্রেরি', href: '/library' },
  { label: 'সেটিংস', href: '/settings' },
];
```

---

## 9. Phase 2 — Homepage (Web)

### Design Concept

The homepage is NOT a marketing page. It IS the product entry point. The user should immediately be able to: continue reading from where they left off, open any Surah, search the Quran, see the daily verse.

### Homepage Layout (top to bottom)

1. Search Omnibox — first viewport utility, full-width search bar
2. Continue Reading card — last read position with Resume button
3. Daily Verse card (Ajker Ayat) — Arabic + Bangla, from a date-seeded algorithm
4. Quick Access — 4-card grid: Read, Hifz, Favorites, Offline
5. Popular Surahs — horizontal scroll cards (Al-Fatiha, Al-Baqarah, Ya-Sin, Ar-Rahman, Al-Mulk, Al-Kahf, Maryam, Al-Waqiah)
6. Reading Progress — streak counter + stats (gentle, not gamified)
7. Footer

### Daily Verse Algorithm

Use a deterministic algorithm seeded by the date to pick a verse:

```typescript
function getDailyVerse(date: Date): { surah: number; ayah: number } {
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
  const totalVerses = 6236;
  const verseIndex = daysSinceEpoch % totalVerses;
  // Map verseIndex to surah:ayah using cumulative verse count lookup
  return mapAbsoluteVerseToSurahAyah(verseIndex + 1);
}
```

---

## 10. Phase 3 — Quran Home Page

### Route: `/quran`

This page is the Quran section landing with:

1. Continue Reading card — shows last-read surah/ayah with Resume button
2. Surah filter/search — instant filter by name (Arabic, English, Bangla)
3. View toggle — List view (default) vs Grid view
4. Revelation filter — All, Meccan, Medinan
5. Juz selector — Jump to Juz 1-30
6. Quick links — Popular Surahs, Short Surahs (Juz 30), Long Surahs

---

## 11. Phase 4 — Surah List Page

### Route: `/quran/surahs`

### Each row displays

- Surah number (in decorative diamond/octagon badge)
- Arabic name (Noto Naskh Arabic, 1.3rem)
- English name + translation
- Bangla name (if available)
- Verse count + Revelation type (Meccan/Medinan)
- Last-read progress indicator (if partially read)
- Play button (inline, starts audio)
- Bookmark indicator (if bookmarked)

### Missing from current implementation

1. **Bangla surah names** — `data/surahs.json` needs Bangla names added
2. **Progress indicator** — visual dot/bar showing reading completion percentage
3. **Grid view option** — Cards instead of list for visual browsing
4. **Juz grouping** — Option to view surahs grouped by Juz

---

## 12. Phase 5 — Surah Reader (Premium)

### Route: `/quran/surahs/[surahNumber]`

This is the MOST CRITICAL page. It must feel world-class.

### Desktop Layout (3-column)

Left column: Surah navigation rail (collapsible list of all 114 surahs)
Center column: Reading content (Bismillah + verse cards)
Right column: Tools panel (audio controls, display toggles, font size, bookmarks)

### Mobile Layout (single column + bottom sheet)

Top: Sticky compact header with surah name, settings gear icon, audio icon
Content: Full-width verse cards
Bottom: Mini audio dock when playing

### Verse Card Design Requirements

Each verse card must contain:
1. Verse badge (surah:ayah) in top-left
2. Action buttons in top-right (Play, Bookmark, Copy, More)
3. Arabic text (largest, RTL, warm white on dark)
4. Section divider labeled BANGLA
5. Bangla translation text
6. Section divider labeled ENGLISH
7. English translation text
8. Section divider labeled TRANSLITERATION (if visible)
9. Transliteration text (italicized)
10. Section divider labeled BANGLA PRONUNCIATION (if visible)
11. Bangla pronunciation text

### Features Missing in Current Reader

1. No user-adjustable font sizes — Must add font size slider in settings
2. No translation visibility toggles — Must let users show/hide each translation layer
3. No reading mode options — Arabic-only, Translation-only, Study (all layers)
4. No verse-level copy/share — Must add per-verse action buttons
5. No reading position tracking — Must save scroll position + verse in localStorage
6. No Bangla surah name in header — Surah header shows only English and Arabic
7. No Juz/Page/Hizb metadata — Should show Juz number in verse badge area
8. No scroll-to-verse — When navigating from search/bookmark, should scroll to exact verse
9. No auto-scroll during audio playback — Active verse should stay in viewport
10. No keyboard shortcuts — J/K for prev/next verse, Space for play/pause

---

## 13. Phase 6 — Audio System Redesign

### Audio Player Architecture

Keep the current `useAudioPlayback.ts` hook architecture but add these features:

1. **Reciter Selection** — Default: Mishary Rashid Alafasy. Future: add more reciters.
2. **Playback Speed** — 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
3. **Repeat Mode** — None, Repeat Ayah, Repeat Surah
4. **Sleep Timer** — 10min, 20min, 30min, 1hr
5. **Background Audio** — Must continue playing when tab is not focused
6. **MediaSession API** — Show current surah/ayah in OS media controls (lock screen)
7. **Mini Dock** — Collapsed single-line player when scrolling
8. **Full Dock** — Expanded player with all controls

### Audio URL Pattern

```typescript
function getAudioUrl(surah: number, ayah: number, reciter = 'ar.alafasy'): string {
  const surahStr = String(surah).padStart(3, '0');
  const ayahStr = String(ayah).padStart(3, '0');
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahStr}${ayahStr}.mp3`;
}
```

### Existing Audio Bugs to Fix

The `useAudioPlayback.ts` fix from the previous guide is still valid:
- `isMountedRef` to guard setState in async `.then()`
- Use `audio.src` instead of `audio.getAttribute('src')` for URL comparison
- Explicit `audio.load()` before `audio.play()`

---

## 14. Phase 7 — Hifz Memorization Mode

### Route: `/hifz`

### Features

1. Surah Selector — Pick surah to memorize
2. Ayah Range — Start and end ayah
3. Repeat Count — How many times to repeat each ayah (1-50)
4. Delay Between Repeats — 0, 1, 2, 3, 5, 10 seconds
5. Layer Hiding — Hide any combination of Arabic, Bangla, English, Transliteration
6. Reveal on Tap — Tap hidden text to temporarily reveal
7. Auto-advance — After N repeats, move to next ayah
8. Session Progress — Show completed vs remaining ayahs
9. Hifz Audio Dock — Distinct from reader dock, shows loop count

### Visual Design for Hidden Layers

```css
.hifz-hidden-layer {
  position: relative;
  filter: blur(8px);
  user-select: none;
  transition: filter var(--duration-slow) var(--ease-decelerate);
}
.hifz-hidden-layer.revealed {
  filter: blur(0);
}
.hifz-reveal-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay);
  border-radius: var(--radius-md);
  color: var(--warm);
  font-weight: 600;
  cursor: pointer;
}
```

---

## 15. Phase 8 — Search System

### Route: `/search`

### Features

1. **Omnibox** — Single search bar searching across Arabic, Bangla, English, Transliteration, Surah names
2. **Instant results** — Results appear as user types (debounced 200ms)
3. **Language filter** — Filter results by search language
4. **Result card** — Shows matching verse with highlighted match text
5. **Click-to-navigate** — Opens surah reader scrolled to the matched verse
6. **Recent searches** — Last 10 searches persisted in localStorage
7. **Search suggestions** — "Try: Rahman, Taqwa, Surah Yasin"

### Search Implementation

Use the existing offline search index built by `apps/web/scripts/build-search.js`. For the static export, pre-build a JSON search index at build time and load it client-side.

---

## 16. Phase 9 — Bookmarks, Last Read, Library

### Route: `/library`

### Sections

1. Continue Reading — Last read position (auto-saved)
2. Bookmarks — User-saved verses with preview text
3. Reading History — Last 20 surahs opened (auto-tracked)
4. Reading Stats — Total verses read, current streak, total days

### Storage Keys

```typescript
const STORAGE_KEYS = {
  LAST_READ: 'alquran_last_read',
  BOOKMARKS: 'alquran_bookmarks',
  READING_HISTORY: 'alquran_reading_history',
  READING_STREAK: 'alquran_reading_streak',
  PREFERENCES: 'alquran_preferences',
  RECENT_SEARCHES: 'alquran_recent_searches',
};
```

### Bookmark Animation

When bookmarking: icon fills with color (moss green), brief scale bounce (0.8 to 1.1 to 1.0, 400ms spring), optional toast notification.

---

## 17. Phase 10 — Settings and Preferences

### Route: `/settings`

### Settings Groups

**Display**: Theme (Dark/Light/System), Arabic font size slider (28-60px), Translation font size slider (13-22px), Line spacing (Compact/Normal/Spacious)

**Reading**: Show Arabic (toggle, default ON), Show Bangla Translation (toggle, default ON), Show English Translation (toggle, default ON), Show Transliteration (toggle, default OFF), Show Bangla Pronunciation (toggle, default OFF), Reading Mode (Translation/Arabic Only/Study)

**Audio**: Default Reciter (Mishary Rashid Alafasy), Auto-play next ayah (toggle, default ON), Playback speed (0.5x to 2x)

**Data**: Clear reading history, Clear bookmarks (with confirmation), Export bookmarks (JSON download), Offline data status

---

## 18. Phase 11 — Offline PWA

### Service Worker Strategy

- App shell — Cache-first (HTML, CSS, JS, fonts)
- Quran data — Cache-first, load all 6 JSON files on first install
- Audio — Network-first with cache fallback
- Search index — Cache-first

### PWA Manifest

**File**: `apps/web/public/manifest.json`

```json
{
  "name": "Al Quran — পবিত্র কুরআন",
  "short_name": "Al Quran",
  "description": "Read, listen & memorize the Holy Quran in Bangla & English",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0B1114",
  "background_color": "#0B1114",
  "categories": ["education", "books"],
  "lang": "bn",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Offline Indicator

Show a subtle banner at top when offline: "আপনি অফলাইন আছেন — সংরক্ষিত ডেটা ব্যবহার করা হচ্ছে"

---

## 19. Phase 12 — Dark Mode and Light Mode

### Dark Mode (Default)

Background: Near-black with green tint (#0B1114). Surface: Slightly lifted (#121A1F). Arabic text: Warm white (#EDF0F2), NOT pure white. Translation text: Secondary gray (#CBD4D9). Active verse: Warm gold subtle glow. Accent: Moss green (#3B8369) for actions. Gold: (#D8B35D) for active states, verse highlights, badges.

### Light Mode

Background: Warm off-white (#F7F8F6). Surface: Pure white. Arabic text: Near-black (#11181C). Translation text: Dark gray (#42515A). Accent: Deeper moss (#2B6E59).

### Theme Switching

```typescript
function getTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('alquran_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
```

---

## 20. Phase 13 — Android App (React Native)

### Bottom Navigation (4 tabs)

Home, Quran, Search, Library

### Screen Architecture

```
BottomTabNavigator
  HomeScreen          -> Continue reading, daily verse, popular surahs, stats
  QuranStack
    SurahListScreen   -> All 114 surahs
    SurahReaderScreen -> Full reader with audio
    HifzScreen        -> Memorization mode
  SearchScreen        -> Omnibox + results
  LibraryScreen       -> Bookmarks, history, stats
```

### React Native Design Rules

1. Bottom tabs: 60px height, with icons from Material Symbols
2. Safe area: Respect notch, rounded corners, gesture bar
3. Touch targets: Minimum 48x48dp
4. Font loading: Bundle Noto Naskh Arabic and Noto Serif Bengali via expo-font
5. Audio: Use expo-av for playback. Support background audio.
6. Storage: MMKV for all local data
7. List performance: Use FlashList for surah list and verse list
8. Haptic feedback: Light haptic on bookmark, play actions
9. Pull-to-refresh: On surah list and library
10. Gesture navigation: Swipe left/right between surahs in reader

### Mobile Reader Specific UX

1. Long-press a verse to show action sheet (Bookmark, Copy, Share, Play)
2. Audio mini-player always visible at bottom when playing
3. Floating action button for play when audio is not active
4. Reading settings via bottom sheet with font size slider, toggles, theme switch
5. Surah navigation: Swipe left for next surah, right for previous

---

## 21. Phase 14 — Android Widgets

### Daily Verse Widget (4x2)

Today verse in Arabic, Bangla translation, Surah:Ayah reference, Open in App action.

### Continue Reading Widget (4x1)

Last read position, Surah name + verse number, Resume action button.

---

## 22. Phase 15 — SEO and Metadata

### Per-Page SEO

| Page | Title | Description |
|------|-------|-------------|
| Home | Al Quran — পবিত্র কুরআন, বাংলা অনুবাদ সহ | Read, listen and memorize the Holy Quran with Bangla and English... |
| Surah List | সূরা তালিকা — All 114 Surahs, Al Quran | Browse all 114 Surahs of the Holy Quran... |
| Surah Reader | সূরা {name} ({translation}) — Surah {number}, Al Quran | Read Surah {name} with Arabic, Bengali, English... |
| Search | কুরআন অনুসন্ধান — Search the Holy Quran, Al Quran | Search across Arabic, Bangla, English translations... |
| Hifz | হিফয মোড — Quran Memorization, Al Quran | Memorize the Holy Quran with repeat, loop, and recall... |

### Structured Data (JSON-LD)

Add schema.org Book markup to each surah page with name, alternativeHeadline (Bangla), inLanguage, numberOfPages, and isPartOf (The Holy Quran).

### Internal Linking

Each surah page links to Previous/Next surah, All 114 surahs, Search page, and Home page.

---

## 23. Phase 16 — Performance Optimization

### Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 95+ |
| LCP | less than 2.5s |
| INP | less than 200ms |
| CLS | less than 0.05 |
| FCP | less than 1.5s |
| Bundle size (initial JS) | less than 100KB |
| Quran data total | approximately 15MB (cached locally) |

### Strategies

1. Static generation — All 114 surah pages pre-rendered via generateStaticParams
2. Font subsetting — Only load Arabic glyphs needed (Quran subset)
3. Data splitting — Load verse data per-surah, not entire Quran at once
4. Virtualized verse list — For long surahs (Al-Baqarah 286 verses)
5. Image optimization — All icons as inline SVG
6. CSS containment — `contain: content` on verse cards
7. Intersection Observer — Lazy-load translations below the fold
8. Preload critical fonts — link rel=preload for Inter and Noto Naskh Arabic

---

## 24. Phase 17 — Accessibility

### WCAG AA Compliance Checklist

1. Color contrast: All text meets 4.5:1 ratio minimum
2. Focus visible: Custom focus ring (2px solid var(--accent), 2px offset)
3. Keyboard navigation: Tab order matches visual order. Space/Enter activate buttons.
4. Screen reader: All interactive elements have aria-label
5. Heading hierarchy: One h1 per page, sequential h2, h3, h4
6. Skip link: Skip to main content as first focusable element
7. Touch targets: 44x44px minimum on all buttons and links
8. Reduced motion: Respect prefers-reduced-motion
9. RTL support: Arabic text in dir=rtl containers
10. Language attributes: lang=ar on Arabic text, lang=bn on Bangla text

### Arabic-Specific Accessibility

- Arabic text containers use lang=ar and dir=rtl
- Arabic font size never smaller than 28px
- Line height for Arabic: minimum 2.0
- Word spacing for Arabic: minimum 4px
- No text truncation on Arabic content

---

## 25. Phase 18 — Deployment

### Web Deployment (Vercel or Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Build command | pnpm run build |
| Build output directory | apps/web/out |
| Node.js version | 22 |

### Android Deployment

1. Build with Expo: npx expo build:android or eas build --platform android
2. Generate signed APK/AAB
3. Upload to Google Play Store
4. Set up Play Store listing with Bangla description and screenshots

---

## 26. Loopholes and Bug Fixes in Current Code

### Critical Bugs

| # | Bug | File | Fix |
|---|-----|------|-----|
| 1 | TypeScript never[] build error | apps/api/src/library/library.service.ts:46 | Add explicit any[] type annotation |
| 2 | No output export for static deploy | apps/web/next.config.ts | Add output: export and trailingSlash: true |
| 3 | Missing out/** in turbo cache | turbo.json | Add out/** to build outputs |
| 4 | Audio play race condition in StrictMode | apps/web/components/quran/useAudioPlayback.ts | Add isMountedRef guard on all setState calls |
| 5 | Audio src comparison uses getAttribute | apps/web/components/quran/useAudioPlayback.ts | Use audio.src (resolved URL) instead |
| 6 | No audio.load() before audio.play() | apps/web/components/quran/useAudioPlayback.ts | Add explicit audio.load() |
| 7 | AudioDock hidden behind mobile chrome | apps/web/app/globals.css | Add padding-bottom: 88px to .main-content.audio-active |
| 8 | Hadith and AI pages exist but user does not want them | Multiple files | Delete all Hadith/AI files and references |

### Design Loopholes

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | No light mode support | globals.css | Add data-theme=light token block |
| 2 | Homepage shows Phase 1 foundation text | apps/web/app/page.tsx | Replace with production-ready content |
| 3 | No Bangla labels in navigation | apps/web/app/layout.tsx | Add Bangla labels |
| 4 | No favicon or app icons | Missing entirely | Generate proper Islamic-themed icon set |
| 5 | No loading skeletons | All pages | Add skeleton components for verse cards, lists |
| 6 | No mobile hamburger menu | layout.tsx | Add responsive mobile nav |
| 7 | Topbar nav overflows on mobile | globals.css | Hide nav links on mobile, show hamburger |
| 8 | No lang attribute on html element | layout.tsx | Set lang=bn (Bangla-first) |
| 9 | No scroll progress indicator | Missing | Add thin progress bar at top |
| 10 | No back-to-top button | Missing | Add floating button on long pages |
| 11 | No daily verse feature | Missing | Compute daily verse from date-based seed |
| 12 | No reading streak tracking | Missing | Add localStorage-based streak system |
| 13 | Audio dock has no mobile responsive layout | globals.css line 1511-1533 | Redesign for mobile |
| 14 | Font sizes are not user-adjustable | Reader page | Add CSS variable-based sizing |
| 15 | No verse-level copy/share actions | QuranReaderClient.tsx | Add action buttons per verse |
| 16 | Surah header card is too plain | QuranReaderClient.tsx | Add Arabic calligraphy, verse count, Juz info |
| 17 | No page transition animations | All routes | Add fadeSlideUp animation |
| 18 | No keyboard shortcuts in reader | QuranReaderClient.tsx | Add J/K/Space/B shortcuts |
| 19 | No Bangla names in surah data | data/surahs.json | Add banglaName field to all 114 surahs |
| 20 | Mobile bottom nav missing for Android | BottomTabNavigator.tsx | Remove Hadith tab, refine styling |

### Performance Loopholes

| # | Issue | Fix |
|---|-------|-----|
| 1 | loadSurahVerses() reads ALL 5 JSON files for every surah | Cache the parsed JSON globally, not per-surah |
| 2 | No font preloading | Add link rel=preload for critical fonts |
| 3 | No virtualization for long surahs | Add virtual scrolling for surahs with 100+ verses |
| 4 | Full Font Awesome CSS loaded from CDN | Replace with tree-shaken Lucide icons |
| 5 | No image optimization | Use Next.js Image component for any images |

---

## 27. File-by-File Change Manifest

### Files to DELETE

```
packages/hadith/                     (entire directory)
apps/web/app/hadith/                 (entire directory)
apps/web/app/ai/                     (entire directory)
apps/api/src/hadith/                 (entire directory)
apps/api/src/ai/                     (entire directory)
apps/mobile/src/screens/HadithScreen.tsx
```

### Files to CREATE (New)

```
apps/web/app/hifz/page.tsx
apps/web/components/DailyVerse.tsx
apps/web/components/ContinueReading.tsx
apps/web/components/SearchOmnibox.tsx
apps/web/components/SkeletonCard.tsx
apps/web/components/BackToTop.tsx
apps/web/components/ScrollProgress.tsx
apps/web/components/ThemeToggle.tsx
apps/web/components/MobileNav.tsx
apps/web/components/quran/VerseActions.tsx
apps/web/components/quran/ReadingSettings.tsx
apps/web/hooks/useLocalStorage.ts
apps/web/hooks/useReadingProgress.ts
apps/web/hooks/useTheme.ts
apps/web/hooks/useKeyboardShortcuts.ts
apps/web/public/icons/icon-192.png
apps/web/public/icons/icon-512.png
apps/web/public/icons/icon-maskable-512.png
```

### Files to MODIFY

```
packages/tokens/src/index.ts          (Complete rewrite — full design system)
packages/types/src/index.ts           (Add new types)
apps/web/app/layout.tsx               (New shell — remove Hadith/AI)
apps/web/app/page.tsx                 (New homepage design)
apps/web/app/globals.css              (Complete rewrite — new design system)
apps/web/app/quran/page.tsx           (Enhanced Quran home)
apps/web/app/quran/surahs/page.tsx    (Enhanced surah list)
apps/web/app/quran/surahs/[surahNumber]/page.tsx  (Enhanced reader)
apps/web/components/quran/QuranReaderClient.tsx    (Premium reader)
apps/web/components/quran/AudioDock.tsx             (Redesigned audio bar)
apps/web/components/quran/useAudioPlayback.ts       (Bug fixes + features)
apps/web/components/quran/HifzClient.tsx            (Enhanced Hifz)
apps/web/lib/data/quran.ts            (Optimize data loading)
apps/web/next.config.ts               (Static export)
apps/web/package.json                 (Remove hadith dep)
apps/mobile/src/navigation/BottomTabNavigator.tsx   (4-tab, no Hadith)
apps/mobile/src/screens/HomeScreen.tsx              (New design)
apps/mobile/src/screens/QuranScreen.tsx             (Enhanced)
apps/mobile/src/screens/SearchScreen.tsx            (Enhanced)
apps/mobile/src/screens/LibraryScreen.tsx           (Enhanced)
apps/mobile/package.json              (Remove hadith dep)
apps/api/src/app.module.ts            (Remove Hadith/AI modules)
apps/api/src/library/library.service.ts  (Fix TS error)
turbo.json                            (Add out/** to outputs)
data/surahs.json                      (Add Bangla names)
```

---

## 28. Verification Checklist

After all changes, verify:

### Build Verification

```bash
# 1. Clean install
pnpm install

# 2. API builds without errors
cd apps/api && pnpm run build
# Expected: 0 errors, dist/ created

# 3. Web builds as static export
cd ../web && pnpm run build
# Expected: out/ created with 114+ HTML files

# 4. Full monorepo build
cd ../.. && pnpm run build
# Expected: All packages build successfully

# 5. Preview static export
npx serve apps/web/out
# Open http://localhost:3000 and verify
```

### Feature Verification (Web)

- Homepage loads with daily verse, continue reading, search bar
- All 114 surahs listed with Arabic, English, Bangla names
- Surah reader shows all verse layers (Arabic, Bangla, English, transliteration)
- Audio plays when clicking Play on a verse
- Audio dock appears at bottom during playback
- Active verse highlights with warm glow during playback
- Bookmarks save and persist across page reloads
- Last read position saves and shows on homepage
- Search returns results across Arabic, Bangla, English
- Dark mode is default and looks premium
- Light mode toggle works
- Font size adjustment works in settings
- Translation visibility toggles work
- Hifz mode loads and allows range selection
- Page transitions have smooth fade animation
- Mobile layout works (hamburger menu, responsive cards)
- No Hadith or AI references exist anywhere
- Keyboard shortcuts work in reader (J/K/Space)
- PWA installs correctly on mobile Chrome
- Offline mode works for cached surahs

### Feature Verification (Android)

- App launches with 4-tab bottom navigation
- Home screen shows continue reading + popular surahs
- Surah list loads all 114 surahs with FlashList
- Surah reader shows verses with Arabic + translations
- Audio plays in background
- Bookmarks persist via MMKV
- Search works offline
- No Hadith tab or screen exists
- Safe area insets respected

### Performance Verification

- Lighthouse score above 95 on surah list page
- LCP less than 2.5s on surah reader page
- No layout shift on page load
- Fonts load without FOUT (preloaded)

---

## Execution Order Summary

For an AI agent executing this plan, follow this exact order:

1. **Delete** Hadith and AI files (Section 2)
2. **Fix** existing build bugs (Section 26 — Critical Bugs)
3. **Update** design tokens (Section 5)
4. **Rewrite** globals.css with new design system (Section 5.2)
5. **Update** types package (Section 4.3)
6. **Build** shell and navigation (Section 8)
7. **Build** homepage (Section 9)
8. **Build** Quran home and surah list (Sections 10-11)
9. **Build** premium surah reader (Section 12)
10. **Fix** and enhance audio system (Section 13)
11. **Build** Hifz mode (Section 14)
12. **Build** search system (Section 15)
13. **Build** library/bookmarks (Section 16)
14. **Build** settings page (Section 17)
15. **Set up** PWA/offline (Section 18)
16. **Implement** dark/light mode toggle (Section 19)
17. **Update** Android app (Section 20)
18. **Add** SEO metadata (Section 22)
19. **Optimize** performance (Section 23)
20. **Verify** accessibility (Section 24)
21. **Run** verification checklist (Section 28)

---

> **END OF IMPLEMENTATION GUIDE**
> Version: 2.0 — Pure Quran Focus
> Last updated: 2026-07-10
> Author: AI Agent (Antigravity)
