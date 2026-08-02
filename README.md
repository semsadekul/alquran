# Al Quran Web App

A premium Quran reading & Hifz (memorization) platform — Next.js 14 App Router,
Tailwind CSS, cream/gold design system with Arabic, Bengali, and English support.

## Tech Stack

- Next.js 14.2.5 (App Router, static generation for all 114 surah pages)
- React 18.3.1 + TypeScript 5.9.3 (strict)
- Tailwind CSS 3.4 + design tokens (CSS variables, light/dark themes)
- ESLint (next/core-web-vitals)

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build + type check
pnpm lint         # ESLint
```

## Quran Data Pipeline

The full Quran corpus (Arabic Uthmani, English Sahih International, Bengali
Muhiuddin Khan — 6,236 ayahs) is downloaded at build/data time and stored as
static JSON under `public/data/verses/{1..114}.json`:

```bash
pnpm fetch:quran   # node scripts/fetch-quran.mjs
```

- The reader fetches only the surah it needs (data-splitting; ~5–350 KB per file).
- The `/api/search` route builds an in-memory index from the same files.
- Commit the generated JSON so builds don't depend on the network.

## Pages

| Page | URL | Notes |
|------|-----|-------|
| Home | `/` | Greeting, daily ayah, real reading streak/goal, recently opened surahs |
| Surah list | `/quran/library` | All 114 surahs, search + Meccan/Medinan filter |
| Surah reader | `/quran/surahs/[n]` | Full Arabic/Bangla/English text, reader settings, prev/next |
| Hifz | `/quran/hifz` | Memorization dashboard, achievements, revision schedule |
| Search | `/search` | Full-corpus search with suggestions, recent searches |
| Duas | `/duas` | Curated daily supplications with categories |
| Stats | `/stats` | Reading heatmap + statistics (real data only) |
| Settings | `/settings` | Theme, language, data export/clear |

## Architecture Notes

- `lib/data/quran.ts` — single source of truth for surah metadata.
- `lib/storage.ts` — typed localStorage layer (reading stats, recent surahs,
  scoped data clearing). Designed to be swapped for Firebase/Firestore later.
- `components/ui/*` — reusable primitives (Card, Button, Badge, Modal, Toast…).
- Navigation is defined once in `lib/nav.ts` (desktop sidebar + mobile nav).

## Roadmap (next)

- Firebase integration (auth, cloud sync, profiles) — deferred by design
- PWA/service worker for offline reading + downloads
- Audio recitation + verse-highlight playback
- Convert remaining static pages to React Server Components
