# Al_Quran - Complete Implementation Plan

# Al\_Quran - Complete Implementation Plan
## Project Overview
Al\_Quran is a premium, ad-free Quran reading application targeting Web (PWA) and Android. The project uses Flutter as a unified codebase for both platforms. It relies entirely on public Quran APIs for content (no custom backend required) and uses on-device local storage for user preferences and data persistence.

**Repository:** [https://github.com/blackwolfyxz-sys/Al\_Quran](https://github.com/blackwolfyxz-sys/Al_Quran)

* * *
## Tech Stack

| Layer | Technology |
| ---| --- |
| Framework | Flutter (single codebase for Web + Android) |
| Language | Dart |
| State Management | flutter\_bloc (BLoC/Cubit pattern) |
| Routing | go\_router |
| HTTP Client | dio |
| Local Storage | hive\_flutter (NoSQL, fast, lightweight) |
| Audio | just\_audio + audio\_service (background playback) |
| Theming | Material Design 3 with custom Islamic aesthetic |
| Web Deployment | Firebase Hosting or Vercel (as PWA) |
| Android Deployment | Google Play Store |
| Fonts | Amiri (Arabic Uthmani), Inter or Poppins (UI) |

* * *
## APIs to Use
### Primary: AlQuran Cloud API ([https://alquran.cloud/api](https://alquran.cloud/api))
*   GET /surah — List all 114 surahs
*   GET /surah/{number} — Full surah with ayahs
*   GET /surah/{number}/{edition} — Surah in specific translation/audio edition
*   GET /ayah/{reference}/{edition} — Single ayah
*   GET /search/{keyword}/{surah}/{edition} — Search
*   GET /edition — List all available editions (translations, tafsirs, audio)
### Secondary: [Quran.com](http://Quran.com) API v4 ([https://api.quran.com/api/v4](https://api.quran.com/api/v4))
*   /chapters — All chapters
*   /verses/by\_chapter/{id} — Verses with translations
*   /resources/tafsirs — Available tafsirs
*   /tafsirs/{tafsir\_id}/by\_ayah/{ayah\_key} — Tafsir content
### Audio Files: [EveryAyah.com](http://EveryAyah.com)
*   Pattern: [https://everyayah.com/data/{reciter\_folder}/{surah\_number}{ayah\_number}.mp3](https://everyayah.com/data/{reciter_folder}/{surah_number}{ayah_number}.mp3)
*   Example: [https://everyayah.com/data/Alafasy\_128kbps/001001.mp3](https://everyayah.com/data/Alafasy_128kbps/001001.mp3)

* * *
## Project Structure

```plain
lib/
├── main.dart
├── app.dart
├── config/
│   ├── routes.dart
│   ├── themes.dart
│   └── constants.dart
├── core/
│   ├── api/
│   │   ├── api_client.dart
│   │   ├── quran_api_service.dart
│   │   └── endpoints.dart
│   ├── models/
│   │   ├── surah.dart
│   │   ├── ayah.dart
│   │   ├── edition.dart
│   │   ├── reciter.dart
│   │   ├── tafsir.dart
│   │   └── bookmark.dart
│   ├── repositories/
│   │   ├── quran_repository.dart
│   │   ├── audio_repository.dart
│   │   ├── bookmark_repository.dart
│   │   └── settings_repository.dart
│   └── utils/
│       ├── arabic_numbers.dart
│       ├── surah_utils.dart
│       └── audio_utils.dart
├── features/
│   ├── home/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── surah_list/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── reading/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── audio_player/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── search/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── bookmarks/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── tafsir/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   ├── settings/
│   │   ├── bloc/
│   │   ├── view/
│   │   └── widgets/
│   └── onboarding/
│       ├── view/
│       └── widgets/
└── shared/
    ├── widgets/
    │   ├── ayah_card.dart
    │   ├── surah_tile.dart
    │   ├── audio_player_bar.dart
    │   ├── loading_shimmer.dart
    │   └── custom_app_bar.dart
    └── extensions/
        └── context_extensions.dart
```

* * *
## Design System & UI/UX Specifications
### Color Palette
**Light Theme:**
*   Primary: #1B5E20 (Deep Islamic Green)
*   Primary Variant: #2E7D32
*   Accent/Gold: #D4A574 (Warm gold for highlights)
*   Background: #FAFAF5 (Warm off-white)
*   Surface: #FFFFFF
*   Text Primary: #1A1A1A
*   Text Secondary: #5C5C5C
*   Arabic Text: #2C2C2C
*   Divider: #E8E8E0

**Dark Theme:**
*   Primary: #4CAF50 (Softer green for dark)
*   Primary Variant: #66BB6A
*   Accent/Gold: #E8B88A
*   Background: #0F1A0F (Deep dark green-black)
*   Surface: #1A2A1A
*   Text Primary: #F5F5F0
*   Text Secondary: #A8A8A0
*   Arabic Text: #FFFFFF
*   Divider: #2A3A2A
### Typography

| Usage | Font | Size | Weight |
| ---| ---| ---| --- |
| Arabic Ayah Text | Amiri / KFGQPC Uthmani | 24-32sp (user adjustable) | Regular |
| Translation Text | Inter | 16-20sp (user adjustable) | Regular |
| Surah Name (Arabic) | Amiri | 20sp | Bold |
| Surah Name (English) | Inter | 16sp | SemiBold |
| UI Headers | Poppins | 18-24sp | SemiBold |
| UI Body | Inter | 14-16sp | Regular |
| Ayah Number (in ornament) | Amiri | 14sp | Regular |

### Spacing & Layout
*   Base unit: 8dp
*   Screen padding: 16dp horizontal
*   Card padding: 16dp
*   Ayah vertical spacing: 24dp between ayahs
*   Arabic line-height: 1.8x (generous for readability)
*   Translation line-height: 1.5x
*   Bottom nav height: 64dp
*   Audio player bar height: 72dp
### Key UI Components
**1\. Bottom Navigation Bar (5 tabs):**
*   Home (mosque icon)
*   Surahs (book icon)
*   Juz (layers icon)
*   Bookmarks (bookmark icon)
*   Settings (gear icon)

**2\. Surah List Item:**
*   Left: Surah number in decorative diamond/star shape
*   Center: Surah name (English + Arabic), ayah count, revelation type badge
*   Right: Play button icon
*   Tap → opens reading view

**3\. Reading View:**
*   Top: Surah header with Bismillah (ornate, centered)
*   Body: Ayah text (Arabic) with verse number in ornamental circle
*   Below each ayah: Translation text (collapsible)
*   Floating action button: bookmark this ayah
*   Swipe left/right: next/prev surah

**4\. Audio Player Bar (persistent bottom bar):**
*   Reciter avatar/icon + name
*   Surah name + current ayah number
*   Play/Pause button (centered, prominent)
*   Skip prev/next ayah buttons
*   Thin progress bar at top of the bar

**5\. Reading Mode (distraction-free):**
*   Hides bottom nav, status bar
*   Only shows Arabic text + translation
*   Tap to reveal controls, auto-hide after 3s
*   Swipe to navigate

* * *
## Step-by-Step Implementation
### PHASE 1: Project Setup & Foundation
**Step 1.1: Initialize Flutter Project**
*   Run: flutter create al\_quran --platforms=android,web
*   Set minimum SDK: Android 21+, Web (all modern browsers)
*   Configure pubspec.yaml with all dependencies listed in tech stack
*   Set up folder structure as defined above

**Step 1.2: Configure Theme System**
*   Create themes.dart with light and dark ThemeData
*   Implement color palette as defined above
*   Register custom fonts (Amiri, Inter, Poppins) in pubspec.yaml and assets/fonts/
*   Create a ThemeCubit to toggle between light/dark and persist preference in Hive

**Step 1.3: Set Up Routing**
*   Configure go\_router with named routes for all screens:
    *   / (home)
    *   /surahs (surah list)
    *   /surah/:id (reading view)
    *   /juz (juz list)
    *   /juz/:id (juz reading)
    *   /bookmarks
    *   /search
    *   /settings
    *   /tafsir/:surahId/:ayahId
    *   /onboarding

**Step 1.4: Set Up API Client**
*   Create Dio instance with base URL: [https://api.alquran.cloud/v1](https://api.alquran.cloud/v1)
*   Add interceptors for logging, error handling, and retry
*   Create QuranApiService with methods for each endpoint
*   Create data models (Surah, Ayah, Edition, Reciter) with fromJson/toJson
*   Add proper error handling with custom exception classes

**Step 1.5: Initialize Local Storage**
*   Initialize Hive in main.dart
*   Create boxes: settingsBox, bookmarksBox, lastReadBox, cacheBox
*   Create repository classes that abstract Hive operations

* * *
### PHASE 2: Surah List & Home Screen
**Step 2.1: Home Screen**
*   Build Home screen with:
    *   Greeting text with user's last read position ("Continue reading Surah Al-Baqarah, Ayah 142")
    *   "Resume" card that navigates to last read position
    *   Daily Ayah card (random ayah, beautifully styled)
    *   Quick access grid: Surah Index, Juz Index, Bookmarks, Search
*   Implement HomeCubit to fetch last read + daily ayah

**Step 2.2: Surah List Screen**
*   Fetch all 114 surahs from API on first load, cache in Hive
*   Display as scrollable list with SurahTile widget
*   Each tile shows: number (in ornamental shape), English name, Arabic name, ayah count, revelation type (Makki/Madani badge)
*   Add search bar at top that filters surahs by name (English or Arabic)
*   Add filter chips: All, Makki, Madani
*   Add sort options: Default (number), Alphabetical, Revelation order
*   Implement SurahListBloc with states: loading, loaded, filtered, error

**Step 2.3: Juz List Screen**
*   Display 30 Juz as cards
*   Each card shows: Juz number, starting surah + ayah, ending surah + ayah
*   Tap navigates to reading view at that juz's start position

* * *
### PHASE 3: Reading View (Core Experience)
**Step 3.1: Basic Reading View**
*   Fetch surah ayahs from API: /surah/{number}/quran-uthmani (Arabic text)
*   Display Bismillah header (styled, centered, ornamental) for all surahs except At-Tawbah
*   Display each ayah as a card with:
    *   Arabic text (Uthmani script, right-aligned, large font)
    *   Verse number in decorative circular ornament
    *   Divider between ayahs
*   Implement smooth infinite scroll with lazy loading
*   Save scroll position on exit

**Step 3.2: Translation Layer**
*   Fetch translation edition alongside Arabic: /surah/{number}/en.asad (English) or /surah/{number}/bn.bengali (Bangla)
*   Display translation text below each ayah (smaller font, different color)
*   Toggle button to show/hide translations
*   Allow user to select translation edition from settings (store preference)
*   Support showing two translations simultaneously (e.g., Bangla + English)

**Step 3.3: Transliteration**
*   Fetch transliteration edition: /surah/{number}/en.transliteration
*   Display below Arabic text, above translation
*   Toggle on/off from reading toolbar
*   Style in italic, muted color

**Step 3.4: Reading Toolbar**
*   Implement a top toolbar (appears on tap, auto-hides in reading mode):
    *   Font size slider (affects Arabic + translation independently)
    *   Translation toggle (on/off)
    *   Transliteration toggle (on/off)
    *   Reading mode toggle (distraction-free)
    *   Theme quick toggle (light/dark)

**Step 3.5: Navigation within Reading View**
*   Swipe left/right to navigate between surahs
*   "Jump to Ayah" button that shows a number picker
*   Surah header at top showing current surah name + total ayahs
*   Scroll-to-top floating button when scrolled far down

* * *
### PHASE 4: Bookmarks & Last Read
**Step 4.1: Bookmark System**
*   Tap bookmark icon on any ayah to save it
*   Store in Hive: {surahNumber, ayahNumber, surahName, timestamp, note (optional)}
*   Show subtle animation on bookmark (heart/star fill)
*   Allow adding a personal note to each bookmark

**Step 4.2: Bookmarks Screen**
*   List all bookmarks sorted by date (newest first)
*   Each item shows: Surah name, Ayah number, Arabic text preview (first 50 chars), date saved, note if any
*   Swipe to delete
*   Tap to navigate directly to that ayah in reading view
*   Search within bookmarks

**Step 4.3: Last Read Tracking**
*   Automatically save last read position (surah + ayah + scroll offset) when user leaves reading view
*   On app launch, show "Continue Reading" card on home screen
*   Store in Hive lastReadBox

* * *
### PHASE 5: Audio Player
**Step 5.1: Audio Integration**
*   Use just\_audio package for playback
*   Fetch audio URL per ayah from [EveryAyah.com](http://EveryAyah.com) or AlQuran Cloud audio editions
*   Build playlist: all ayahs of current surah as sequential audio items
*   Implement AudioPlayerBloc with states: idle, loading, playing, paused, completed

**Step 5.2: Persistent Audio Player Bar**
*   Show floating bar above bottom navigation when audio is active
*   Display: reciter name, current surah/ayah, play/pause, prev/next ayah
*   Thin progress indicator showing position within current ayah
*   Tap bar to expand into full audio player screen

**Step 5.3: Ayah-by-Ayah Highlighting**
*   When audio plays, highlight the current ayah in reading view
*   Auto-scroll to keep current ayah visible
*   Highlight style: subtle background color change + left border accent
*   Sync precisely using audio position callbacks

**Step 5.4: Reciter Selection**
*   Fetch available reciters from /edition?format=audio&type=versebyverse
*   Popular defaults: Mishary Rashid Alafasy, Abdul Rahman Al-Sudais, Maher Al Muaiqly
*   Reciter picker in settings + quick switch in audio player
*   Store preferred reciter in Hive

**Step 5.5: Background Playback (Android)**
*   Use audio\_service package for background/lock screen playback
*   Show media notification with controls
*   Support continuous play (auto-advance to next surah)
*   Repeat modes: repeat ayah, repeat surah, no repeat

* * *
### PHASE 6: Search
**Step 6.1: Search Screen**
*   Search input at top with clear button
*   Search across: surah names, ayah text (Arabic), translation text
*   Use API: /search/{keyword}/{surah}/en.asad for translation search
*   For surah name search, filter locally from cached surah list
*   Display results as cards: Surah name, Ayah number, matched text with keyword highlighted
*   Tap result to navigate to that ayah in reading view

**Step 6.2: Search History**
*   Store last 20 searches in Hive
*   Show as chips below search bar when empty
*   Tap to re-execute search
*   Clear all option

* * *
### PHASE 7: Tafsir
**Step 7.1: Tafsir Integration**
*   Use [Quran.com](http://Quran.com) API v4 for tafsir content
*   Available tafsirs: Ibn Kathir (English), Tafsir al-Jalalayn, Bengali Tafsir
*   Add "Tafsir" button on each ayah in reading view
*   Tap opens bottom sheet or new screen with tafsir content

**Step 7.2: Tafsir View**
*   Show full tafsir text for selected ayah
*   Display ayah Arabic text at top as reference
*   Allow switching between available tafsirs via tabs
*   Support scrolling through consecutive ayah tafsirs
*   Store preferred tafsir in settings

* * *
### PHASE 8: Settings & Customization
**Step 8.1: Settings Screen**
*   Sections:
    *   Appearance: Theme (Light/Dark/System), Arabic font size, Translation font size
    *   Reading: Default translation language, Show transliteration by default, Reading mode default
    *   Audio: Default reciter, Auto-play next surah, Repeat mode
    *   Notifications: Daily Ayah reminder (time picker)
    *   Storage: Clear cache, Download for offline
    *   About: Version, Credits, Open source licenses, Rate app

**Step 8.2: Onboarding Flow (First Launch)**
*   Screen 1: Welcome + app description
*   Screen 2: Choose language (English/Bangla/Arabic)
*   Screen 3: Choose preferred translation
*   Screen 4: Choose theme (Light/Dark)
*   Screen 5: Choose preferred reciter (with audio preview)
*   Smooth page transitions with illustrations
*   Skip button available, "Get Started" on final screen
*   Store onboarding\_complete=true in Hive

* * *
### PHASE 9: Offline Support & Caching
**Step 9.1: Smart Caching**
*   Cache all surah metadata on first load (rarely changes)
*   Cache viewed surahs (Arabic text + translation) in Hive
*   Cache strategy: cache-first with background refresh every 7 days
*   Show cached content when offline with "offline" indicator

**Step 9.2: Download for Offline**
*   Settings option: "Download Full Quran for Offline"
*   Downloads all 114 surahs Arabic text + selected translation
*   Show download progress (percentage + surah count)
*   Optional: Download audio for selected surahs (warn about storage size)
*   Store downloaded status per surah

* * *
### PHASE 10: Platform-Specific Features
**Step 10.1: Android-Specific**
*   Home screen widget showing daily ayah (using home\_widget package)
*   Share ayah as formatted image (generate card with Arabic text + translation on decorative background using screenshot/render\_repaint\_boundary)
*   Notification for daily reading reminder (using flutter\_local\_notifications)
*   Material You dynamic color support (Android 12+)
*   Edge-to-edge display

**Step 10.2: Web-Specific (PWA)**
*   Configure web/manifest.json for PWA (installable)
*   Service worker for offline caching
*   Responsive layout: single column on mobile, split-pane on desktop (surah list left, reading right)
*   Keyboard shortcuts: Space (play/pause), Arrow keys (prev/next ayah), B (bookmark), Esc (close modals)
*   URL routing that reflects current surah/ayah for shareability
*   Meta tags for SEO (Open Graph, Twitter Card)

* * *
### PHASE 11: Polish & Performance
**Step 11.1: Animations & Micro-interactions**
*   Page transitions: fade + slide
*   Bookmark tap: scale bounce + fill animation
*   List loading: shimmer skeleton screens (not spinners)
*   Pull-to-refresh on surah list
*   Smooth scroll physics on reading view
*   Audio player bar: slide up on appear, slide down on dismiss
*   Ayah highlight: smooth background color transition

**Step 11.2: Performance Optimization**
*   Lazy load ayahs (paginate long surahs like Al-Baqarah)
*   Use ListView.builder for all lists (not Column)
*   Minimize rebuilds with BlocSelector and Equatable
*   Image/asset caching with cached\_network\_image
*   Reduce app size: tree-shake icons, compress assets
*   Web: code splitting, deferred loading for heavy routes

**Step 11.3: Accessibility**
*   Semantic labels on all interactive elements
*   Support TalkBack (Android) and screen readers (Web)
*   Minimum touch target: 48x48dp
*   Sufficient color contrast (WCAG AA)
*   Respect system font scale

* * *
### PHASE 12: Testing & Deployment
**Step 12.1: Testing**
*   Unit tests for all BLoC/Cubit classes
*   Unit tests for repository methods
*   Widget tests for key screens (home, surah list, reading view)
*   Integration test: full flow from surah list to reading to bookmark
*   Test offline mode behavior

**Step 12.2: Android Deployment**
*   Generate signed APK/AAB
*   Prepare Play Store listing: screenshots (phone + tablet), description, feature graphic
*   Set up Firebase Crashlytics for error reporting
*   Create privacy policy page (no data collected, all local)
*   Submit to Google Play Store

**Step 12.3: Web Deployment**
*   Build: flutter build web --release
*   Deploy to Firebase Hosting (or Vercel)
*   Configure custom domain if available
*   Test PWA install flow on Chrome, Safari, Edge
*   Submit to search engines (sitemap.xml)

* * *
## Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_bloc: ^8.1.0
  go_router: ^14.0.0
  dio: ^5.4.0
  hive_flutter: ^1.1.0
  just_audio: ^0.9.36
  audio_service: ^0.18.12
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  flutter_local_notifications: ^17.0.0
  share_plus: ^7.2.0
  home_widget: ^0.5.0
  google_fonts: ^6.1.0
  equatable: ^2.0.5
  intl: ^0.19.0
  connectivity_plus: ^6.0.0
  path_provider: ^2.1.0
  url_launcher: ^6.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  bloc_test: ^9.1.0
  mocktail: ^1.0.0
  very_good_analysis: ^5.1.0
```

* * *
## Success Criteria
*   App loads surah list in under 2 seconds
*   Arabic text renders beautifully with proper Uthmani font
*   Audio plays without buffering gaps between ayahs
*   Works fully offline after first content load
*   Smooth 60fps scrolling on reading view
*   App size under 25MB (excluding downloaded audio)
*   PWA scores 90+ on Lighthouse
*   Zero crashes on supported devices

* * *
## Notes
*   No backend server needed. All data comes from public APIs + local storage.
*   No user authentication needed for v1.
*   All content is public domain (Quran text) or open-licensed.
*   Future v2 consideration: cloud sync with Firebase, community features, memorization tracker (Hifz mode).