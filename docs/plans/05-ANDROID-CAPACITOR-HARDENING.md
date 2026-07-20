# Phase 3 — Android / Capacitor Hardening

Goal: a reliable, professional Android shell before the offline feature lands. All work here is small but load-bearing.

## 1. Dependency alignment

Root `package.json` currently: `@capacitor/core 6.2.0`, `@capacitor/android 6.2.1`, `@capacitor/cli 6.2.1` (mismatch).

- Align all `@capacitor/*` to the same latest **6.x** patch (do not jump to 7 in this phase — minimize variables).
- Add plugins (root, since the Capacitor project lives at repo root):
  - `@capacitor/filesystem` (offline audio — Phase 4)
  - `@capacitor/network` (wifi-only policy, auto-pause)
  - `@capacitor/app` (back button, app state)
  - `@capacitor/status-bar` (theme-colored status bar)
  - `@capacitor/splash-screen` (branded launch)
  - `@capacitor/share` (native share for verses; web falls back to `navigator.share`)
- Run `npx cap sync android` and verify `android/capacitor.settings.gradle` now includes each plugin project (it currently includes ONLY `capacitor-android`).

In `apps/web/package.json`: replace `react`/`react-dom` `19.0.0-rc-69d4b800-20241021` with stable React 19 and matching `@types/react`/`@types/react-dom` 19; run typecheck and fix any fallout (expected: none or trivial).

## 2. capacitor.config.json

```json
{
  "appId": "com.sadek.alquran",
  "appName": "Al Quran",
  "webDir": "apps/web/out",
  "server": { "androidScheme": "https" },
  "android": { "allowMixedContent": false },
  "plugins": {
    "SplashScreen": { "launchShowDuration": 800, "backgroundColor": "#0a3622", "showSpinner": false },
    "StatusBar": { "style": "DARK", "backgroundColor": "#0a3622" }
  }
}
```

Note: `appName` currently "Al Quran Offline" — confirm final store name with owner (cosmetic).

## 3. Native shell behavior (web-side code)

Create `apps/web/components/providers/NativeProvider.tsx` (client, mounted in layout; all calls guarded by `Capacitor.isNativePlatform()`):

1. **Status bar:** on theme change (subscribe to ThemeProvider) set style/background: light theme → dark icons on `#f8f6f0`? No — header is always emerald, so keep `backgroundColor #0a3622`, `style: Dark` (light icons) in both themes for a seamless header. With `viewport-fit=cover` + header safe-area padding (Phase 1 §8) consider `overlaysWebView: true` for edge-to-edge; if that causes issues, keep non-overlay solid color.
2. **Back button** (`@capacitor/app` `backButton` event): if an open `Sheet`/modal → close it; else if `history.length > 1` → `history.back()`; else if not on `/` → navigate `/`; else `App.exitApp()` (double-press-to-exit with toast "Press back again to exit", 2 s window).
3. **Splash:** `SplashScreen.hide()` after first paint (call in `useEffect` of the provider).
4. **App state:** on `appStateChange` inactive → persist any pending manifest writes (Phase 4 hook point).

## 4. Android project

- `AndroidManifest.xml`: keep `INTERNET`; no storage permission needed (`Directory.Data` is app-private). Confirm `android:supportsRtl="true"` (already set).
- `variables.gradle`: confirm `minSdkVersion ≥ 22` (Capacitor 6 default), `targetSdkVersion` per current Play requirements (34+).
- App icon + splash: current launcher is the default Capacitor icon. Generate proper icons/splash from a provided logo using `@capacitor/assets` (`npx capacitor-assets generate`) — **needs a 1024×1024 logo from the owner** (open question; use a temporary emerald/gold monogram if not provided).
- `strings.xml`: app name consistency with config.

## 5. Build pipeline scripts (root package.json)

```json
{
  "scripts": {
    "build:web": "pnpm --filter @alquran/web build",
    "sync:android": "npx cap sync android",
    "build:android": "pnpm build:web && npx cap sync android",
    "open:android": "npx cap open android",
    "android": "pnpm build:android && npx cap open android"
  }
}
```

Rule for the agent: **never edit** `android/app/src/main/assets/public` (generated). Any web change requires `pnpm build:android` before testing on device.

## 6. Static-export correctness inside WebView

- Verify all internal links are relative (Next `Link` — fine) and `trailingSlash: true` remains (needed for directory index resolution — also required by the Capacitor local server).
- Verify no page/runtime code references `window.location.origin` for building asset URLs.
- Smoke test matrix in emulator: cold start → Home; navigate every tab; open surah 1, 2, 114; tafsir page; rotate device (layout survives `configChanges` already declared); background→foreground; offline cold start (airplane mode): everything renders (fonts/data bundled), audio shows friendly error.

## Definition of Done (Phase 3)

- `pnpm build:android` runs clean end-to-end; APK builds in Android Studio.
- All plugins listed in `capacitor.settings.gradle`; versions aligned; stable React.
- Status bar colored, splash branded, back button behaves per spec, safe areas respected on a gesture-nav device profile.
- Airplane-mode cold start renders the full UI correctly.
