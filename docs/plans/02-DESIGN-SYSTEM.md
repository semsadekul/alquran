# Phase 1 — Premium Design System ("Majestic")

Goal: one coherent, premium, fully responsive design language for web + Android, implemented as Tailwind 4 tokens + a small set of shared React components. The existing home page and header set the visual direction: **deep emerald + antique gold, Islamic geometric texture, glassmorphism accents, serif display type**.

## 1. Design principles

1. **Reverence + clarity.** The Quran text is the hero: generous whitespace, large Uthmani Arabic, muted chrome around it.
2. **Mobile-first, thumb-first.** Primary actions reachable in the bottom half of the screen on mobile; bottom nav + floating audio dock.
3. **Calm motion.** Use the existing duration/easing tokens (`--duration-*`, `--ease-*`); animate opacity/transform only; respect `prefers-reduced-motion` (already in globals.css).
4. **Both themes are first-class.** Emerald-dark ("Night Prayer") and warm-light ("Sage Light") — all components must be built with semantic CSS variables (`var(--surface)`, `var(--text-1)`, …), never raw hex in JSX.

## 2. Token layer (extend `app/globals.css` `@theme`)

The semantic variables in `globals.css` (`--bg`, `--surface`, `--text-1..4`, `--accent`, `--border`, shadows, radii) are well designed — **keep them** and fix the theme-selection bug:

```css
/* REPLACE the current block at globals.css:86
   `[data-theme="dark"], :root { … }`  — remove `:root` so dark is opt-in */
[data-theme="dark"] { color-scheme: dark; --bg: #072b1b; /* …unchanged vars… */ }

/* Light theme block stays as-is; ALSO make it the :root default: */
:root, [data-theme="light"] { color-scheme: light; --bg: #f8f6f0; /* …unchanged… */ }
```

Additionally register semantic colors as Tailwind theme colors so utilities like `bg-surface`, `text-primary` work:

```css
@theme inline {
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-surface-elevated: var(--surface-elevated);
  --color-ink: var(--text-1);
  --color-ink-2: var(--text-2);
  --color-ink-3: var(--text-3);
  --color-ink-4: var(--text-4);
  --color-accent: var(--accent);
  --color-accent-subtle: var(--accent-subtle);
  --color-gold: var(--warm);
  --color-line: var(--border);
  --color-line-subtle: var(--border-subtle);
}
```

Usage rule for the agent: **JSX may only use Tailwind utilities built on these tokens** (`bg-surface text-ink border-line`, `bg-accent-subtle`, etc.) or the small set of `.component` classes defined in §3. Raw `bg-[#0a3622]` style arbitrary hexes are only allowed for the branded header/footer/bottom-nav gradient (already established) — nowhere else.

## 3. Component library (`apps/web/components/ui/`)

Create these ONCE in Phase 1; every page conversion in Phase 2 must use them. All are client-agnostic (server-compatible) unless noted.

| Component | File | API / notes |
|---|---|---|
| `PageShell` | `ui/PageShell.tsx` | `<PageShell title eyebrow lede actions?>` → replaces undefined `page-container`/`page-hero`. Renders `max-w-7xl w-full mx-auto px-4 sm:px-6`, animated `page-enter`. |
| `Card` | `ui/Card.tsx` | Variants: `default`, `interactive` (hover lift), `hero` (emerald gradient like home). Uses `bg-surface border border-line rounded-2xl shadow-[var(--shadow-card)]`. |
| `Button` | `ui/Button.tsx` | Variants `primary` (emerald), `gold`, `ghost`, `danger`; sizes `sm/md/lg`; `min-h-11` (44px) on mobile; loading state with spinner; renders `<button>` or `<Link>`. |
| `IconButton` | `ui/IconButton.tsx` | 44×44 tap area, lucide icon, `aria-label` required prop. |
| `Badge` | `ui/Badge.tsx` | `tone: gold/green/neutral/danger` — replaces `card-badge`, `pack-type`. |
| `Toggle` | `ui/Toggle.tsx` (client) | Accessible switch (role="switch"), controlled; replaces dead `SettingToggle`. |
| `Progress` | `ui/Progress.tsx` | Determinate bar + optional label; used by downloads & hifz. Gold fill on emerald track. |
| `Sheet` | `ui/Sheet.tsx` (client) | Bottom sheet on mobile / side panel ≥md. Used by ReadingSettings, VerseActions, reciter picker. Focus-trap, `Escape` close, backdrop `bg-[var(--overlay)]`. |
| `EmptyState` | `ui/EmptyState.tsx` | Icon + title + hint + optional action; replaces undefined `empty-state`. |
| `Skeleton` | `ui/Skeleton.tsx` | Wraps existing `.skeleton` keyframes. |
| `SegmentedControl` | `ui/SegmentedControl.tsx` (client) | For EN/BN toggle, reading modes, theme picker. |
| `VerseCard` | `ui/VerseCard.tsx` | The reader's core block — see §7. |

Also create `lib/cn.ts` (tiny `clsx`-style class join helper, no new dependency needed — implement in 5 lines).

## 4. Typography & self-hosted fonts (fixes offline fonts)

Replace the Google Fonts `@import` (globals.css line 1 — DELETE it) with `next/font` in `app/layout.tsx`:

```tsx
import { Inter, Noto_Naskh_Arabic, Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const arabic = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400','500','600','700'], variable: '--font-arabic', display: 'swap' });
const bengali = Noto_Serif_Bengali({ subsets: ['bengali'], weight: ['400','500','600','700'], variable: '--font-bengali', display: 'swap' });
const bengaliUi = Hind_Siliguri({ subsets: ['bengali'], weight: ['400','500','600','700'], variable: '--font-bengali-ui', display: 'swap' });
// <html className={`${inter.variable} ${arabic.variable} ${bengali.variable} ${bengaliUi.variable}`}>
```

`next/font` downloads fonts **at build time** and serves them from the static export → they are bundled into the Android APK by `cap sync`. Keep the `--font-*` variable names identical so existing CSS keeps working. Verify in the built `out/` that `.woff2` files exist and no `fonts.googleapis.com` request remains (QA step).

Type scale (already good in globals.css — keep `clamp()` based `h1–h3`, `.verse-arabic`, `.verse-bangla`, `.verse-english`). Add:

```css
.display-title { font-family: var(--font-serif, Georgia, serif); letter-spacing: 0.12em; }
.bismillah { font-family: var(--font-arabic); font-size: clamp(1.6rem, 3vw + 0.6rem, 2.6rem); text-align: center; color: var(--warm); direction: rtl; }
```

## 5. Theme system (real, persisted)

Create `components/providers/ThemeProvider.tsx` (client):

- Context: `{ theme: 'light'|'dark'|'system', resolvedTheme, setTheme }`. **Default: `system`** (owner decision — follows `prefers-color-scheme`; user override persisted).
- On mount + on change: set `document.documentElement.dataset.theme = resolvedTheme`; persist choice in `localStorage('alquran_theme')`; listen to `matchMedia('(prefers-color-scheme: dark)')` when `system`.
- **No-flash boot:** inline `<script>` in `<head>` (layout.tsx) that reads localStorage and sets `data-theme` before paint (standard pattern; safe in static export).
- Add a theme `IconButton` (sun/moon) to the header actions area and a full picker (Light/Dark/System `SegmentedControl`) on the Settings page.
- Remove the hardcoded `data-theme="light"` from `layout.tsx:27`.

## 6. Language toggle (EN/BN)

Create `components/providers/LocaleProvider.tsx` (client): `locale: 'en'|'bn'` persisted in `localStorage('alquran_locale')`, **default `'bn'`** (owner decision), plus `t(key)` over a small dictionary file `lib/i18n.ts` covering nav labels, page titles, common buttons (~60 strings, both languages — write Bengali strings first, they are the default experience). Wire the header `SegmentedControl` to it. Bengali UI strings use `font-bengali-ui`. (Full content translation is out of scope; verse translations already exist per-verse.)

## 7. Reader design (the flagship screen)

`VerseCard` layout (replaces undefined classes in `QuranReaderClient`):

- Container: `rounded-2xl px-4 py-5 md:px-8 md:py-7 transition-colors`, active state = `bg-[var(--active-verse-bg)] ring-1 ring-[var(--active-verse-border)]` (keep the existing `verse-card-active` pulse as an option).
- Row 1: verse number in an octagon-star badge (gold outline, `text-xs`), then action icons (play, bookmark, copy, share, tafsir link) as `IconButton`s — on mobile collapse into a `Sheet` opened by a ⋯ button.
- Row 2: Arabic — `dir="rtl" lang="ar"` `.verse-arabic`, full width.
- Row 3+: transliteration (italic, `text-ink-3`), Bangla, English — each toggleable via preferences (already wired).
- Surah header: emerald `Card` variant `hero` with surah number medallion, Arabic calligraphic name, English name + translation, meta chips (`Badge`), actions: `Button primary` "Play Surah", `Button ghost` "Hifz Mode", and (Phase 4 adds) a Download button.
- Sticky mini-header on scroll (client): surah name + ayah progress + settings icon, `backdrop-blur bg-[var(--glass)]`.

Audio dock redesign (`AudioDock.tsx`): fixed bottom bar **above** the mobile bottom nav (`bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-4`), `max-w-3xl mx-auto rounded-2xl` floating card, `bg-[var(--glass)] backdrop-blur border border-[var(--glass-border)] shadow-[var(--shadow-elevated)]`. Replace text glyphs with lucide icons (`Play`, `Pause`, `SkipBack`, `SkipForward`, `Square`, `Repeat`). Show reciter name; tapping it opens reciter `Sheet`. On <380 px hide the time labels, keep progress bar.

## 8. Layout & safe areas (Android-ready shell)

In `app/layout.tsx`:

1. Export `viewport`: `{ width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0a3622' }`.
2. Header: `pt-[env(safe-area-inset-top)]` on the sticky header wrapper (so it extends under a translucent status bar).
3. Bottom nav: `pb-[calc(env(safe-area-inset-bottom))]` added to existing padding; height `64px` content + inset.
4. Main: `pb-24 md:pb-0` must become `pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-0` when the audio dock is visible — implement by moving audio dock + spacing into a client `AppChrome` wrapper.
5. Extract client components from the server layout: `Header.tsx` (theme + language controls), `BottomNav.tsx` (active state via `usePathname()`), keep layout itself server.
6. `BottomNav` tabs: Home `/`, Quran `/quran`, Hifz `/quran/hifz`, Duas `/duas`, Library `/library`. **Keep `/duas` — the page will be BUILT** (owner decision; spec in `03-RESPONSIVE-UI-FIXES.md` §2.8 — build it in the same phase so the tab never 404s; until that section is done, the tab may point to a styled "coming soon" `EmptyState` page committed in Phase 1). `/offline` and `/settings` are reachable via header/home links. Active logic: exact match for `/`, `pathname.startsWith(href)` otherwise, longest-match wins so `/quran/hifz` highlights Hifz not Quran.

## 9. Responsive rules (system-wide)

- Breakpoints: base = 360–767 (design target 390), `md` ≥768 (tablet, 2-col grids), `lg` ≥1024 (desktop, 3-col + wider reader `max-w-3xl` centered), `xl` ≥1280.
- Grids: always `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4/5/6` — never fixed columns without breakpoints, never `minmax(280px,…)` auto-fills inside narrow parents.
- Long Arabic/Bengali words: containers get `min-w-0` inside flex rows; text blocks `break-words`.
- Horizontal scroll is forbidden: QA checks `document.documentElement.scrollWidth === clientWidth` at 360 px on every route.
- Images/icons: no raw `<img>` without dimensions.
- Modals/sheets: full-screen bottom sheet under `md`, centered panel above.

## Definition of Done (Phase 1)

- Tokens compiled; `bg-surface`/`text-ink`/etc. utilities work in a test page.
- All §3 components exist with TypeScript props, render in both themes.
- Fonts self-hosted: build output contains woff2, zero external font requests.
- ThemeProvider (system default) + LocaleProvider (Bangla default) + new Header/BottomNav live in layout; theme & language toggles work and persist; active tab follows route; `/duas` route exists (at minimum a styled placeholder until 03 §2.8 builds the full feature); `apps/mobile`, `apps/api`, `apps/al_quran` removed from the workspace (first commit).
- `pnpm --filter @alquran/web build` and `typecheck` pass.
