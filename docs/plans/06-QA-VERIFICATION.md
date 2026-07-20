# Phase 5 — QA & Verification Checklist

Run the relevant section after each phase; run EVERYTHING before release. Any failure = phase not done.

## A. Automated gates (run after every change set)

- [ ] `pnpm --filter @alquran/web typecheck`
- [ ] `pnpm --filter @alquran/web lint`
- [ ] `node apps/web/scripts/check-classes.mjs` (no undefined semantic classes)
- [ ] `pnpm --filter @alquran/web build` (static export succeeds)
- [ ] Grep gates:
  - [ ] `grep -rE "fetch\([\`'\"]/api" apps/web/app apps/web/components` → zero results (catches both quote styles; `/search-index.json` fetches are allowed)
  - [ ] `grep -r "fonts.googleapis" apps/web` → zero results
  - [ ] `grep -rn "data-theme=\"light\"" apps/web/app/layout.tsx` → zero results (theme set by provider)
  - [ ] `/duas` and `/duas/[id]` pages exist and export statically (owner decided to BUILD the Duas feature)
- [ ] Serve `apps/web/out` statically (`npx serve`) and click through all routes — no 404s, no console errors.

## B. Responsive matrix (web, DevTools device emulation)

Routes: `/`, `/duas`, `/duas/[id]` (one sample), `/quran`, `/quran/surahs`, `/quran/surahs/2` (longest), `/quran/surahs/114`, `/quran/tafsir/2/282`, `/quran/hifz`, `/quran/compare`, `/search`, `/library` (+4 subpages), `/hadith`, `/hadith/collections/bukhari`, `/offline`, `/settings`, `/books`, `/ai`, `/teacher`, unknown URL (404 page).

For each route × widths **360, 390, 768, 1024, 1440**:
- [ ] No horizontal scrollbar (`scrollWidth === clientWidth`)
- [ ] No overlapping/clipped text; Arabic wraps correctly; Bengali renders (no tofu)
- [ ] Interactive elements ≥ 44 px on touch widths; visible focus rings via keyboard
- [ ] Light AND dark theme both correct (no invisible text, hardcoded colors)
- [ ] Bottom nav shows correct active tab; audio dock doesn't cover content or nav

## C. Functional (web)

- [ ] Theme toggle: persists across reload; system mode follows OS; no flash-of-wrong-theme on load
- [ ] Language toggle EN/BN: nav + page chrome strings switch and persist
- [ ] Continue Reading: fresh profile shows default; after reading surah X ayah Y, home card shows it with Arabic preview (network disabled)
- [ ] Reader: play surah, play single ayah, auto-advance, active verse highlight + auto-scroll (not hidden by sticky header), seek, volume, speed, reciter switch **takes effect immediately mid-play**
- [ ] Verse actions: bookmark (appears in /library/bookmarks), copy, share, tafsir link
- [ ] Reading settings: font sizes live-update, visibility toggles, persistence
- [ ] Settings page: every control writes and persists; migration from old IndexedDB `app_config` works
- [ ] Search, hifz flows, compare, hadith pages function
- [ ] Keyboard shortcuts: next/prev verse, play/pause

## D. Android (emulator + at least one real gesture-nav device)

Shell:
- [ ] `pnpm build:android` → APK builds and installs
- [ ] Splash (emerald, no spinner) → Home < 3 s; status bar emerald w/ light icons in both themes
- [ ] Safe areas: bottom nav clear of gesture bar; header under status bar correctly; landscape OK
- [ ] Back button: closes sheets → history → home → double-press exit
- [ ] Airplane-mode **cold start**: full UI + fonts + all text data render; every route works; audio shows friendly offline message
- [ ] Rotation, background/foreground, low-memory return — no white screens

Offline audio (Phase 4):
- [ ] Download surah 114 → progress states cycle correctly → complete badge; folder contains 6 files
- [ ] Download surah 2 (286 ayahs, ~60 MB): progress %, pause mid-way → resume continues (no re-download of existing files — verify via timestamps)
- [ ] Kill app mid-download → relaunch → "Resume?" snackbar → resumes correctly
- [ ] Wi-Fi-only ON + switch to cellular profile → auto-pause + message; back on Wi-Fi → resume
- [ ] Airplane mode: downloaded surah plays start-to-finish with auto-advance; "Offline" badge shows; non-downloaded surah → friendly error with link to Download Center
- [ ] Download All: global progress advances; app remains usable while downloading; cancel works
- [ ] Delete surah → files gone (verify via `adb shell run-as com.sadek.alquran ls files/audio/...`), status resets, re-download works; Delete All works
- [ ] Verify action repairs a manually corrupted surah (delete one file via adb, run Verify)
- [ ] Storage meter ≈ real usage (adb `du`); low-disk simulation → clean error, resumable after cleanup
- [ ] Lock screen / notification media controls: play/pause/next work; metadata shows surah name
- [ ] Reciter architecture: change default reciterId constant in a dev build → downloads/paths/manifest keep working (future-reciter readiness)

## E. Performance & polish

- [ ] Lighthouse (mobile) on `/` and `/quran/surahs/2`: Performance ≥ 85, A11y ≥ 95, no CLS from fonts (next/font)
- [ ] Surah 2 scroll on mid-range Android profile (4× CPU throttle): no jank; if failing, apply `content-visibility` fix (03 §6)
- [ ] APK size sanity (< ~60 MB without audio)
- [ ] All user-facing strings exist in EN + BN dictionaries

## F. Release gate

- [ ] All boxes above checked
- [ ] Owner decisions implemented: theme follows system by default, Bangla default UI language, Duas page built (40 Rabbana duas), apps/mobile + apps/api removed
- [ ] Owner sign-off on: app display name, everyayah.com as audio source
- [ ] Tag release; archive `docs/plans` status notes with date + deviations from plan
