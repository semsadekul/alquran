# Phase 2 — Page-by-Page UI Conversion & Responsive Fixes

Prerequisite: Phase 1 complete (design system, providers, Header/BottomNav shipped).

Convert pages in the order below (highest user impact first). For EVERY page: delete all undefined semantic classes, rebuild with design-system components + Tailwind tokens, verify at 360/768/1024/1440 px, verify both themes, then run the guard script (§7) and the build.

## 1. Conversion recipe (apply to each page)

1. Open the page; list every non-Tailwind className it uses.
2. Map: `page-container`/`page-hero` → `PageShell`; card-ish divs → `Card`; buttons → `Button`/`IconButton`; badges → `Badge`; empty states → `EmptyState`; toggles → `Toggle`; modals → `Sheet`.
3. Layout with responsive grid rules (Design System §9).
4. Arabic blocks: `dir="rtl" lang="ar"` + `.verse-arabic` (or `font-arabic` utilities). Bengali: `font-bengali` / `font-bengali-ui`.
5. Interactive elements: min 44 px tap target, visible `focus-visible:ring-2 ring-[var(--border-focus)]`.
6. Keep ALL existing logic/state/handlers — this phase is presentational unless a defect is listed below.

## 2. Priority order & per-page notes

### 2.1 `/quran/surahs/[surahNumber]` — the Reader (+ `QuranReaderClient`, `AudioDock`, `VerseActions`, `ReadingSettings`)
- Rebuild with `VerseCard`, surah hero `Card`, sticky mini-header, floating `AudioDock` (Design System §7).
- Fix **C4**: in `useAudioPlayback.ts` — verify mid-play reciter switching works (deps already include `state.reciterId`; delete the stale comment in `setReciter`); ensure playback-rate changes apply immediately (`setPlaybackRate` already sets it on the element — confirm and remove the redundant read in the play effect or add it to deps).
- Fix **C7**: keyboard/onPrevVerse should play previous verse while playing (mirror of next).
- `ReadingSettings` becomes a `Sheet`: font-size sliders (already functional via CSS vars), visibility toggles, line-spacing, theme shortcut.
- `VerseActions` becomes icon row + mobile `Sheet` (copy, bookmark → IndexedDB `bookmarks` store, share via `navigator.share` with clipboard fallback, tafsir link).
- Verify: 6-line Arabic ayahs (2:282) wrap correctly at 360 px; active-verse auto-scroll doesn't hide behind sticky header (`scroll-margin-top`).

### 2.2 `/quran` hub + `/quran/surahs` (+ `SurahListClient`, `SearchOmnibox`, `ContinueReading`)
- Surah list: responsive grid `1/2/3` cols of `Card interactive`; each card: number medallion, Arabic name (rtl), English name + translation, ayah count + revelation `Badge`. Search/filter input full-width sticky on mobile.
- `SearchOmnibox`: restyle with tokens; results dropdown becomes full-screen sheet under `md`.

### 2.3 Home `/`
- Fix **A3**: delete the `fetch('/api/verse…')` block. Instead: `useReadingProgress` already writes `alquran_last_read` — extend what the reader saves to include `{surah, ayah, surahName, arabicPreview, numberOfAyahs}` so the card renders entirely from localStorage; fall back to a static default object for first-time users (no network).
- Keep existing Tailwind design; extract repeated card patterns to `Card` where trivial. Verify hifz ring SVG scales on 360 px.

### 2.4 `/offline`
- Convert to `PageShell` + `Card` list now (presentational); real download logic replaces the fake `togglePack` in **Phase 4** — leave a `// PHASE4:` marker where the DownloadManager hooks in.
- Hadith/book packs: keep visible with `Badge tone=neutral` "Coming soon", buttons disabled.

### 2.5 `/library` + 4 subpages (bookmarks, notes, highlights, collections)
- `PageShell`, stat chips as `Badge`, item lists as `Card` rows with `EmptyState` fallbacks. Bookmark rows link to `/quran/surahs/{s}/#verse-{a}`.

### 2.6 `/settings`
- Fix **C3**: make every `Toggle` controlled + persist. **Unify settings sources:** migrate to the single localStorage key `alquran_preferences` (reader already uses it). On first load, if IndexedDB `app_config` exists and localStorage doesn't, migrate values across, then treat localStorage as canonical. Theme picker uses ThemeProvider; language uses LocaleProvider; font scale slider drives the same multiplier the reader reads.

### 2.7 `/search`, `/quran/compare`, `/quran/tafsir/[surah]/[ayah]`, `/quran/hifz` + `[surah]` (`HifzClient`), `/hadith` + `/hadith/collections/[slug]`, `/books`, `/ai`, `/teacher`
- Same recipe. Tafsir page: reader-grade typography, prev/next ayah pager (sticky bottom on mobile). Hifz: use `Progress` for memorization; verify the reveal/practice interactions have 44 px targets. `/ai`: its `/api/ai/*` fetches cannot work in a static export (verified: `app/ai/page.tsx:36-42`) — convert the page to a polished `EmptyState` "Coming soon" inside `PageShell` and remove the dead fetch code. `/teacher` and `/books`: same treatment if placeholder. Note `/search` and `/quran/compare` fetching `/search-index.json` is CORRECT (bundled static asset) — do not remove.

### 2.8 `/duas` — NEW page (owner decision: build it)

Create `app/duas/page.tsx` + `app/duas/[id]/page.tsx` (static, `generateStaticParams`):

- **Data:** build-time script `scripts/build-duas.mjs` extracts the **40 Rabbana duas** from the bundled Quran data (well-known canonical list of surah:ayah references — e.g. 2:127, 2:128, 2:201, 2:250, 2:285-286, 3:8, 3:16, 3:53, 3:147, 3:191-194, 5:83, 7:23, 7:47, 7:89, 7:126, 10:85-86, 14:38, 14:40-41, 18:10, 23:109, 25:65, 25:74, 40:7-9, 59:10, 60:4-5, 66:8 …) into `data/duas.json`: `{id, titleBn, titleEn, refs:[{surah, ayahStart, ayahEnd}], arabic, bangla, english, transliteration}` — Arabic/Bangla/English pulled from existing verse data, titles written by the agent in both languages.
- **List page:** `PageShell` "দু'আ / Duas", search box, grid of `Card interactive` (Bengali title, Arabic first line, reference badge e.g. "আল-বাকারা ২:২০১").
- **Detail page:** reader-grade layout (`VerseCard` styling), Arabic + transliteration + Bangla + English, source reference linking to the tafsir/reader ayah, play button (reuses ayah audio via existing playback — the refs ARE ayahs), bookmark + copy + share.
- Fully offline (bundled data). Definition of done: `/duas` and all detail pages render statically, tab active-state works.

## 3. Global fixes while converting

- Footer links: Home, Quran, Duas, Offline (footer `/duas` link now valid).
- Add `app/not-found.tsx` styled 404 (`PageShell` + `EmptyState` + link home) — Capacitor navigation to unknown paths should not show browser default.
- Add `loading.tsx` skeletons for `/quran/surahs` and reader route using `Skeleton`.
- Sweep for remaining raw hexes in JSX (allowed only in branded chrome) and for `style={{}}` layout hacks.

## 4. Orphaned components (decide + act)

| File | Action |
|---|---|
| `components/MobileNav.tsx` | DELETE (superseded by `BottomNav`). |
| `components/AudioPlayer.tsx` | DELETE (superseded by `AudioDock`). |
| `components/DailyVerse.tsx` | KEEP+WIRE: restyle and add to Home as "Verse of the Day" `Card` (pick verse deterministically from date, from bundled data — no network). |
| `components/ScrollProgress.tsx` | KEEP+WIRE in reader sticky mini-header (thin gold bar). |
| `components/BackToTop.tsx` | KEEP+WIRE on reader + surah list; position above bottom nav w/ safe-area. |

## 5. RTL & typography QA per page

- No Arabic string inside an LTR sentence without `<span dir="rtl" lang="ar">`.
- `text-align: right` only via `dir`, not hardcoded alignment utilities on Arabic blocks.
- Bengali numerals/labels use `font-bengali-ui`; check ellipsis/truncation (`truncate` needs `min-w-0` parent).

## 6. Performance passes

- Surah 2 page renders 286 `VerseCard`s: ensure no per-card inline `new` objects in hot paths; memoize `VerseCard` (`React.memo`, props primitive). If scroll jank is measured on mid-range Android, add `content-visibility: auto; contain-intrinsic-size: 320px` to verse cards (CSS-only virtualization) — do NOT add a virtualization library.
- Icons: import lucide icons individually (already tree-shaken); no icon font.

## 7. Guard script (prevents regression to undefined classes)

Add `apps/web/scripts/check-classes.mjs` + npm script `lint:classes`, run in CI/`prebuild`:

1. Collect defined classes: parse `app/globals.css` for `.class` selectors; plus an allowlist file `scripts/allowed-classes.json` (Tailwind utilities are validated separately by the Tailwind build; this script targets *semantic* classes: any class token NOT matching Tailwind utility patterns and NOT defined in CSS → error with file:line).
2. Simplest robust heuristic: flag tokens matching `/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/` that aren't in the defined/allowed sets and aren't known Tailwind roots (`bg-`, `text-`, `flex`, `grid-`, `border-`, `rounded-`, `shadow-`, `p[trblxy]?-`, `m[trblxy]?-`, `gap-`, `w-`, `h-`, `min-`, `max-`, `items-`, `justify-`, `font-`, `tracking-`, `leading-`, `z-`, `top-`, `bottom-`, `left-`, `right-`, `inset-`, `overflow-`, `transition`, `duration-`, `ease-`, `animate-`, `hover:`, `focus`, `group`, `md:`, `lg:`, `sm:`, `xl:`, arbitrary `[...]`, etc.).
3. Exit non-zero on findings. Wire into `package.json`: `"prebuild": "node scripts/build-search.js && node scripts/check-classes.mjs"`.

## Definition of Done (Phase 2)

- Zero undefined classes repo-wide (guard passes).
- Every route: correct styling in both themes, no horizontal scroll at 360 px, AA contrast for body text, working nav/theme/language, Continue Reading works offline.
- Reader: verse actions, settings sheet, audio dock all functional on touch + keyboard.
- `build` + `typecheck` green; static export loads correctly via `npx serve apps/web/out` smoke test.
