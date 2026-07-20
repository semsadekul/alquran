# Phase 4 — Offline Quran Audio Downloads (Android / Capacitor)

Goal: users can download recitation audio **per surah** or the **entire Quran**, see progress, pause/resume, manage storage, and play fully offline. One reciter at launch (**Alafasy_128kbps**, the current default), but every API below takes `reciterId` so adding reciters later is config-only.

Prerequisites: Phases 1–3 complete (design system, pages converted, Capacitor plugins installed per `05-ANDROID-CAPACITOR-HARDENING.md`).

## 0. Facts about the current audio system (verified)

- Streaming source: `https://everyayah.com/data/{reciterId}/{SSS}{AAA}.mp3` — one file **per ayah** (`apps/web/components/quran/audio-utils.ts:13`). Example: `.../Alafasy_128kbps/002282.mp3`.
- 6,236 ayah files for the full Quran; Alafasy_128kbps totals ≈ **1.2 GB** (avg ≈ 190 KB/file; long ayahs several MB).
- Playback: single `HTMLAudioElement` in `useAudioPlayback.ts`; playlist auto-advance; errors show "requires an internet connection".
- IndexedDB `AlQuranOfflineDB` v1 exists (`apps/web/lib/storage/indexeddb.ts`).

## 1. Architecture overview

```
apps/web/lib/audio/
  types.ts            // SurahAudioStatus, DownloadJob, ReciterInfo
  audioStore.ts       // IndexedDB v2: 'audioManifest' store (per surah+reciter record)
  audioSource.ts      // resolve playback URL: local file if downloaded, else remote
  downloadManager.ts  // singleton queue: enqueue/pause/resume/cancel/delete, events
  platform.ts         // Capacitor detection + Filesystem/Network wrappers
components/audio/
  DownloadButton.tsx      // per-surah button w/ states (idle→queued→downloading %→done)
  DownloadCenterClient.tsx// the real /offline page section
  StorageMeter.tsx        // used space, per-reciter breakdown
```

- **Platform gate:** `Capacitor.isNativePlatform()` (import from `@capacitor/core` — already a dependency; ALSO add `@capacitor/filesystem` and `@capacitor/network`, see Phase 3 doc). On web, the Download Center shows an informational card: "Audio downloads are available in the Android app" (a web Cache-API implementation is a later optional enhancement — design `audioSource.ts` so a `WebCacheBackend` can slot in).
- **Storage layout (app-private, no permissions needed):** `Directory.Data`, path `audio/{reciterId}/{surah3}/{surah3}{ayah3}.mp3` (e.g. `audio/Alafasy_128kbps/002/002282.mp3`). Per-surah folder enables cheap delete via `Filesystem.rmdir({recursive:true})`.
- **Manifest (source of truth for UI):** IndexedDB store `audioManifest`, key `${reciterId}:${surah}`:

```ts
interface SurahAudioRecord {
  key: string;            // "Alafasy_128kbps:2"
  reciterId: string; surah: number;
  totalAyahs: number; downloadedAyahs: number;
  bytes: number;          // actual bytes on disk (sum of stat sizes)
  status: 'none'|'queued'|'downloading'|'paused'|'complete'|'error';
  updatedAt: number;
}
```

Bump `DB_VERSION` to 2 in `indexeddb.ts`; add the store in `onupgradeneeded` (existing stores untouched).

## 2. DownloadManager (core logic)

Singleton (module scope), event-emitter pattern (`subscribe(listener)` → React hook `useDownloads()` via `useSyncExternalStore`).

Behavior spec:

1. **Enqueue surah:** create/merge manifest record → status `queued`; push surah job into FIFO queue. **Enqueue all:** enqueue surahs 1–114 (skip `complete` ones); set a `fullQuran` flag so global progress = Σ downloadedAyahs / 6236.
2. **Worker loop:** process ONE surah at a time; within a surah, download ayah files with **concurrency 3** (promise pool). For each ayah:
   - Skip if file already exists with size > 0 (`Filesystem.stat`) — this is what makes **resume free**.
   - Download via `Filesystem.downloadFile({ url, path, directory: Directory.Data, recursive: true })`.
   - Validate: resulting size > 1 KB (everyayah error pages are tiny); on invalid, delete file and count as failure.
   - Retry: 3 attempts, backoff 1s/3s/9s. After 3 failures of the same ayah → surah status `error` (keep partial files), continue queue with next surah.
   - After each ayah: increment `downloadedAyahs`, add bytes, persist manifest (throttle writes to ≥1/s per surah), emit progress event.
3. **Pause:** flag checked between ayah downloads; in-flight ayah finishes, then status `paused`. **Resume:** re-enqueue (existing-file skip fast-forwards). **Cancel:** pause + reset status `none` (keep or delete partial per user choice — UI offers "Keep partial" / "Delete").
4. **Delete surah:** `rmdir` the surah folder, reset record. **Delete all:** iterate reciter folder.
5. **Network policy:** via `@capacitor/network` — if `connectionType !== 'wifi'` and user setting `wifiOnly` (default ON, stored in `alquran_preferences`) → prompt before starting; listen for `networkStatusChange`: on loss → auto-pause with status message; on regain (and wifi ok) → auto-resume if it was auto-paused.
6. **App restart recovery:** on boot, any record left in `downloading/queued` → set `paused` (UI shows Resume). Never trust `downloadedAyahs` blindly for `complete`; `complete` requires downloadedAyahs === totalAyahs.
7. **Verify action** (Storage screen): re-scan a surah folder with `stat` per file, fix manifest drift, re-download missing files.
8. **Storage guard:** before "Download All", check free space via `navigator.storage.estimate()` fallback + warn (~1.3 GB needed). Handle `downloadFile` quota/IO errors → surah status `error` with human message.

Ayah counts per surah: reuse existing bundled surah metadata (`getSurahs().numberOfAyahs` data is already in the static pages; for client use, emit `apps/web/public/data/surah-meta.json` at build via the existing prebuild script and fetch it locally — it ships inside the app bundle, still offline-safe).

## 3. Offline playback integration (minimal invasive)

`audioSource.ts`:

```ts
export async function getAyahSrc(surah: number, ayah: number, reciterId: string): Promise<string> {
  if (isNative() && await isAyahDownloaded(reciterId, surah, ayah)) {
    const { uri } = await Filesystem.getUri({ directory: Directory.Data, path: ayahPath(reciterId, surah, ayah) });
    return Capacitor.convertFileSrc(uri);       // → https://localhost/_capacitor_file_/...
  }
  return getEveryAyahUrl(surah, ayah, reciterId); // existing remote URL
}
```

`isAyahDownloaded` uses an in-memory `Set<string>` of completed surahs (from manifest, loaded once + kept fresh by subscription) → O(1), no per-ayah disk stat during playback; for `partial` surahs, fall back to one `Filesystem.stat`.

Modify `useAudioPlayback.ts` play-effect: it currently sets `audio.src = getEveryAyahUrl(...)` synchronously (line ~142). Change to async resolution via `getAyahSrc` (guard against race: ignore resolution if `currentAyah` changed meanwhile). Improve the error handler: if offline (`!navigator.onLine`) and ayah not downloaded → message "This surah isn't downloaded. Download it from the Offline page to listen offline." with a link/button to `/offline`.

**Media Session** (lock-screen controls in Android WebView): in the same hook, set `navigator.mediaSession.metadata` (surah name, verse ref, app artwork from bundled asset) and action handlers (play/pause/next/prev → existing playback API). Cheap win, works in Chrome WebView.

## 4. UI/UX specification (premium)

### 4.1 Download Center (`/offline` page — replaces mock)
- Hero `Card`: reciter avatar/name (Alafasy), quality "128 kbps", total size est. "~1.2 GB", global ring `Progress` when full-download active, primary `Button gold` **Download All** ⇄ **Pause All** / **Resume All**; secondary text: downloaded X of 114 surahs · Y GB used.
- `StorageMeter`: horizontal bar — used by audio vs free device space; "Wi-Fi only" `Toggle`.
- Surah list (all 114, searchable): each row = number medallion, names, size (est. before download / actual after), trailing `DownloadButton`:
  - `none` → download icon (↓)
  - `queued` → clock icon
  - `downloading` → circular progress ring with % + tap to pause
  - `paused` → resume icon + "Paused at 43%"
  - `complete` → gold check; long-press/⋯ → Delete, Verify
  - `error` → warning icon + Retry
- Batch chips: "First 10 surahs", "Juz Amma (78–114)", "Al-Baqarah" quick actions.
- Keep hadith/book preview packs below in a separate "Coming soon" section.

### 4.2 Reader integration
- Surah hero card gets a `DownloadButton` (same states) next to Play Surah.
- When playing from local files show a subtle "Offline" `Badge` in the AudioDock.

### 4.3 States & copy
- Progress notifications inside the app only (no system notification service in v1 — WebView limitation; note: downloads pause when the app is killed; auto-resume on next launch prompt: "Resume downloading Al-Baqarah (61%)?" — snackbar on app open when paused jobs exist).
- All copy available in EN + BN via `lib/i18n.ts`.

## 5. Implementation order (commit-sized steps)

1. `platform.ts` + install/sync `@capacitor/filesystem`, `@capacitor/network` (Phase 3 does plugin install; verify here).
2. IndexedDB v2 + `audioStore.ts` + unit-testable pure helpers (`ayahPath`, `formatBytes`, progress math).
3. `downloadManager.ts` with single-surah download + skip-existing resume; manual test on emulator with Surah 114 (6 files) then 108, 1.
4. `useDownloads()` hook + `DownloadButton` + wire into reader hero.
5. Download Center page UI (list, search, batch chips, storage meter).
6. Download All + pause/resume/cancel + network policy + restart recovery.
7. `audioSource.ts` + `useAudioPlayback` integration + offline error copy + Media Session.
8. Delete/verify/storage management + polish + BN strings.
9. Full QA per `06-QA-VERIFICATION.md` §D (includes airplane-mode playback test and 2:282 long-ayah test).

## 6. Risks & mitigations

- **everyayah.com throttling/availability:** concurrency capped at 3, backoff on failure, resumable by design. Long-term: mirror to own CDN (open question #4).
- **6,236 small files = slow full download** (realistic: 30–90 min on good Wi-Fi): set expectations in UI ("You can keep using the app while downloading"), surah-level progress keeps it legible. Do NOT attempt zip download+unzip in v1 (webview memory risk).
- **WebView kills downloads when app is backgrounded long:** acceptable v1 (auto-resume); if owner later wants true background downloads, that's a native plugin task — out of scope now.
- **Disk full mid-download:** per-ayah error handling marks surah `error` with clear message; partial files are kept and resumable after space is freed.
