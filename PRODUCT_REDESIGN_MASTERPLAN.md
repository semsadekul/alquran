# Bengali Islamic Ecosystem Redesign Masterplan

## 1. Executive Direction

This product should not be treated as a styled Quran reader. It should become a full Bengali Islamic knowledge platform with three tightly aligned surfaces:

1. Website for discovery, study, SEO, deep reading, and cross-linking.
2. PWA for offline reading, repeat usage, bookmarks, audio, and lightweight installability.
3. Android app for daily active use, widgets, notifications, downloads, and device-native flows.

The right benchmark is not a single competitor. It is the combined product quality of:

- `Quran.com` for clarity and reading ergonomics
- `Notion` for information architecture
- `Linear` for focus and compositional discipline
- `Spotify` for media-state handling and continuity
- `Material 3` for Android-native behavior
- `Apple HIG` for restraint and readability

The product should feel calm, trustworthy, premium, and distinctly Islamic without looking ornamental or nostalgic.

## 2. Audit of Current Product

### What exists today

Current codebase strengths from the repo:

- offline-first Quran data model using IndexedDB
- local sync flow for surahs and verses
- Bangla, English, Arabic, transliteration, Bangla pronunciation
- verse-level bookmarks
- last-read persistence
- search across local Quran dataset
- audio recitation playback
- hifz loop mode
- service worker and manifest
- Capacitor Android wrapper
- a more modern emerald-and-gold redesign already applied to the current HTML app

Relevant implementation points:

- [index.html](C:/Users/Sadek/Downloads/Al_Quran/index.html:1) contains the full app shell and all views in one document.
- [app.js](C:/Users/Sadek/Downloads/Al_Quran/app.js:1) contains data loading, state, rendering, search, audio, hifz, settings, persistence, and event wiring.
- [style.css](C:/Users/Sadek/Downloads/Al_Quran/style.css:1) contains a substantial premium visual system, but still inside a monolithic CSS file.
- [sw.js](C:/Users/Sadek/Downloads/Al_Quran/sw.js:1) provides cache-first offline behavior.

### Core product problems

The current product is better than a legacy Bootstrap site, but it still has structural limitations that will prevent it from becoming the leading Bengali Islamic platform.

#### 1. Information architecture is too Quran-centric

The prompt describes a broader ecosystem: Quran, Tafsir, Hadith, Books, AI, Audio, Search, Downloads, Android, Website. The current product architecture is fundamentally a Quran reader with adjacent utilities.

Impact:

- Hadith, books, tafsir, AI, collections, and account-level features are not first-class product domains.
- Navigation will not scale once the content library grows.
- Users cannot build a mental model of the whole platform.

#### 2. Monolithic frontend architecture

The app is entirely assembled in a single HTML file with imperative DOM rendering in one large JS file.

Impact:

- feature velocity slows as the system grows
- testing is difficult
- accessibility regressions are easy to introduce
- shared states like audio, bookmarks, reading history, and search are harder to normalize
- Android, web, and PWA cannot share a clean design system or component library

#### 3. Visual identity is improved but still too decorative in places

The current redesign uses emerald/gold glass panels, ambient particles, orbs, and layered effects. It is visually richer than the legacy references, but some of those devices compete with the reverent reading use case.

Impact:

- reader comfort drops on long sessions
- some views feel like a premium dashboard instead of a sacred reading surface
- ornamental glow can reduce clarity on lower-end displays

#### 4. Search is useful but not product-grade yet

Current search is a local text match system for Quran verses. It is not yet a true ecosystem search.

Missing:

- Hadith search
n- book search
- topic search
- search intents
- suggestions by scholar, narrator, surah, reciter, category
- typo tolerance in Bangla
- structured filters
- instant navigation actions
- cross-content ranking

#### 5. Reading UX is good for a single-mode app, not yet world-class

Current reader includes:

- Arabic
- Bangla meaning
- English meaning
- transliteration
- Bangla pronunciation
- bookmarks
- last read
- audio
- focus mode

Still missing for a leading product:

- word-by-word mode
- tafsir side panel
- translation comparison layout
- grammar/root insights
- reading goal system
- memorization journeys
- more reciter control
- paragraph grouping and semantic chunking
- study mode and note organization
- cross-reference graph

#### 6. Weak mobile-specific product model

The current app can be wrapped for Android, but the interaction model is still web-first.

Missing:

- bottom navigation architecture
- gesture patterns tuned for thumb reach
- app widgets
- download manager
- Android media controls integration
- notification-driven re-entry
- offline queueing and sync feedback
- tablet split-pane experiences

#### 7. Accessibility is partially considered, not systematized

Good existing signs:

- focus styles
- toggle controls
- visible labels
- reduced-motion consideration in some logic

Still missing as a platform standard:

- semantic heading map per screen
- screen reader reading order strategy
- dynamic type policy
- focus trap and escape patterns for all overlays
- color contrast token governance
- large Arabic readability constraints
- touch target consistency

### UI review of current and legacy screenshots

Based on the provided screenshots and the current product direction, the legacy visual problems are clear:

- dense top navigation with many competing categories
- heavy menu bar styling
- inconsistent icon language
- large black hero slider with weak product utility
- poor visual hierarchy between core actions and promotional content
- old web layout conventions with banner thinking instead of product workflow thinking
- inconsistent whitespace and line-length handling
- content blocks feel assembled, not composed
- the reading interface mixes controls, metadata, and content too tightly
- footer and informational areas are text-heavy and visually dated

### Summary of what to keep

These are worth preserving conceptually:

- offline-first behavior
- local-first Quran access
- verse-level persistence
- audio recitation flow
- hifz as a core feature
- Bangla-first content strategy
- dark reading-oriented palette direction

## 3. Product Strategy

### Product positioning

This should become:

`The most trusted and beautifully usable Bengali Islamic study platform for reading, listening, searching, learning, and daily practice.`

### Primary audiences

1. Daily Quran readers in Bangladesh
2. Bangla-speaking Hadith learners
3. Students of tafsir and Islamic books
4. Listeners and memorizers
5. Teachers, parents, and young learners
6. Users with intermittent internet access

### Product pillars

1. `Reverent reading`: sacred text must feel clear, calm, and uncompromised.
2. `Fast retrieval`: users should find anything in seconds.
3. `Offline reliability`: core content remains available without network dependence.
4. `Cross-format learning`: Quran, Hadith, Tafsir, Books, Audio, and AI should reinforce each other.
5. `Bangla-first excellence`: not translation as an afterthought, but native product design for Bangla readers.

## 4. Recommended Technology Architecture

### Frontend web

Recommended stack:

- `Next.js 15` with App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS 4` if stable in your environment, otherwise latest Tailwind 3.x
- `shadcn/ui` primitives over `Radix UI`
- `Framer Motion` for restrained motion
- `TanStack Query` for async state
- `Zustand` for client UI state only
- `next-intl` or a lightweight i18n layer for interface localization
- `next-pwa` or a custom service worker depending on caching needs

Why:

- best balance of SEO, streaming, performance, and maintainability
- server components for content pages
- easy route segmentation for Quran, Hadith, Books, AI, and user account areas
- strong ecosystem support for PWA and metadata

### Backend

Recommended stack:

- `NestJS`
- `PostgreSQL`
- `Prisma`
- `Redis`
- `Meilisearch` initially, with optional migration to `Elasticsearch/OpenSearch` if scale demands it
- object storage for audio/downloadable assets

Why:

- NestJS gives structure for a large multi-domain platform
- Prisma accelerates schema evolution
- Redis handles caching, sessions, rate limiting, and background coordination
- Meilisearch is operationally lighter and fast enough for MVP-to-growth

### Android app

Recommended choice: `React Native` with Expo modules only where they do not fight native requirements.

Why React Native over Flutter here:

- stronger code sharing with React web design primitives and product teams
- easier reuse of business logic, domain models, design tokens, and state patterns
- better organizational fit if the website is also React

Use:

- `React Native` + `TypeScript`
- `React Navigation`
- `React Native Reanimated`
- `FlashList`
- `MMKV` or SQLite for local app persistence
- `react-query`

### Shared packages in a monorepo

Use `pnpm` + `Turborepo`.

Suggested top-level apps:

- `apps/web`
- `apps/mobile`
- `apps/api`
- `apps/docs`

Suggested shared packages:

- `packages/ui-web`
- `packages/ui-mobile`
- `packages/tokens`
- `packages/types`
- `packages/quran-domain`
- `packages/hadith-domain`
- `packages/search-contracts`
- `packages/eslint-config`
- `packages/tsconfig`

## 5. Information Architecture

### Primary top-level domains

The ecosystem should be organized around user intent, not your database structure.

Top-level navigation:

- `Home`
- `Quran`
- `Hadith`
- `Books`
- `Search`
- `Listen`
- `AI`
- `Library`
- `Profile`

### Website sitemap

- Home
- Quran Home
- Surah List
- Surah Reader
- Ayah Detail
- Translation Comparison
- Tafsir
- Word by Word
- Topic Explorer
- Hadith Home
- Collection List
- Collection Detail
- Book Detail
- Chapter Detail
- Hadith Reader
- Narrator Detail
- Islamic Books Home
- Category List
- Book Detail
- Chapter Reader
- Search
- AI Assistant
- Downloads
- Bookmarks
- Highlights
- Notes
- Collections
- Reading History
- Audio Library
- Reciter Detail
- Settings
- Donation
- About
- Contact
- 404

### Android app primary nav

Use 5-tab bottom navigation:

- `Home`
- `Quran`
- `Hadith`
- `Search`
- `Library`

Secondary destinations go in drawer / profile / overflow:

- Books
- Audio
- AI
- Downloads
- Settings
- Offline
- Donation
- About

## 6. Design Philosophy

### Core principles

1. `Reading first`
   Content must dominate decorative UI.

2. `Quiet premium`
   Premium should come from spacing, typography, material quality, motion, and restraint.

3. `Sacred clarity`
   Quran and Hadith pages should never feel noisy, game-like, or ad-like.

4. `Bangla native`
   Bangla should look intentional, not squeezed into an English-first layout.

5. `Mode-aware surfaces`
   Search, reader, study, and listening each deserve different interaction density.

### Visual direction

Do not build around glassmorphism as the identity. Use it sparingly.

The product should use:

- layered neutral surfaces
- strong typography
- warm accent restraint
- precise spacing
- subtle depth
- soft edges
- very deliberate icon use

Avoid:

- ambient decorative particles in reading screens
- strong glow around content cards
- neon contrast
- banner-slider homepage patterns
- marketing-style hero sections for core product pages

## 7. Full Design System

### Color system

Use a broader, calmer palette than the current emerald-gold dominant treatment.

#### Brand palette

- `Ink 950` `#0B1114`
- `Slate 900` `#121A1F`
- `Slate 800` `#1B252C`
- `Stone 50` `#F7F8F6`
- `Stone 100` `#F1F2EE`
- `Moss 700` `#1D5C4A`
- `Moss 600` `#2B6E59`
- `Moss 500` `#3B8369`
- `Gold 600` `#B8891F`
- `Gold 500` `#C89A2B`
- `Gold 400` `#D8B35D`
- `Teal 600` `#0D766E`

#### Light mode

- background: `#F7F8F6`
- surface: `#FFFFFF`
- surface-muted: `#F1F3F0`
- surface-elevated: `#FFFFFF`
- border: `#E2E7E3`
- text-primary: `#11181C`
- text-secondary: `#42515A`
- text-muted: `#6A7780`

#### Dark mode

- background: `#0B1114`
- surface: `#121A1F`
- surface-muted: `#162127`
- surface-elevated: `#1A262D`
- border: `#26343D`
- text-primary: `#F5F7F8`
- text-secondary: `#CBD4D9`
- text-muted: `#8D9AA2`

#### Semantic colors

- success: `#1F8A5B`
- warning: `#C58A1C`
- danger: `#C64F4F`
- info: `#2F7CC2`

### Color usage rules

- Gold is an accent, not a background color.
- Moss is the main identity color for action and theological calm.
- Quran reading should be neutral-first with selective accent usage.
- Hadith can tolerate slightly denser meta-data presentation than Quran.

### Typography

#### Arabic

Primary reading font:

- `Noto Naskh Arabic` or `Uthmanic Hafs` if licensing and rendering quality are acceptable

Secondary display Arabic:

- `Amiri Quran` for headings and ceremonial moments only

Why:

- long-form readability matters more than classical flourish
- Arabic must render cleanly on low- and mid-range Android devices

#### Bangla

Recommended:

- `Noto Serif Bengali` for long-form reading
- `Hind Siliguri` or `Noto Sans Bengali` for UI labels and controls

Why:

- Bangla translation and Bangla metadata need separate typographic roles
- serif Bangla improves reading comfort in dense prose
- sans Bangla improves small UI legibility

#### English

Recommended:

- `Inter` for product UI
- `Source Serif 4` optional for long-form editorial content

### Type scale

#### Display

- 48 / 56
- 40 / 48
- 32 / 40

#### Heading

- 28 / 36
- 24 / 32
- 20 / 28
- 18 / 26

#### Body

- 16 / 28 long-form reading
- 15 / 24 dense interface prose
- 14 / 22 metadata
- 13 / 20 secondary labels

#### Arabic reading sizes

- mobile default ayah: `34-38px`
- desktop default ayah: `40-46px`
- adjustable scale up to `56px`

### Icon system

Recommended: `Lucide` for web and interface controls.

Why:

- restrained, modern, readable
- works well with premium enterprise-like product surfaces
- avoids over-stylized or inconsistent icon shapes

For Android-specific surfaces, use platform-consistent icons or `Material Symbols` where native expectation matters.

### Spacing system

Use 4px base with 8px rhythm emphasis.

Tokens:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64
- 80

Rules:

- dense controls use 8/12/16
- standard panels use 20/24/32
- page sections use 48/64/80

### Radius system

- xs: 8
- sm: 10
- md: 14
- lg: 18
- xl: 24

Avoid fully rounded large cards across the product. Keep corners refined.

### Elevation system

- level 0: flat background
- level 1: content surface
- level 2: raised tool surface
- level 3: modal / overlay / player

Use shadows lightly. Prefer border + contrast separation over dramatic blur.

## 8. Component Library

### Buttons

Types:

- primary
- secondary
- tertiary
- destructive
- tonal
- icon-only

Rules:

- icons for tool actions
- text buttons for explicit commands
- minimum 44x44 touch target

### Core cards

- verse card
- hadith card
- book card
- topic card
- collection card
- download card
- reciter card

### Navigation components

- global top nav for web
- bottom nav for mobile/app
- left rail for tablet/desktop study surfaces
- drawer for secondary destinations
- contextual subnav inside Quran/Hadith/Books

### Reader components

- surah header
- ayah card
- inline translation stack
- translation comparison row
- tafsir side sheet
- word-by-word chip row
- audio sync controls
- bookmark/highlight/note toolbar
- reading settings sheet

### Search components

- omnibox
- recent history list
- autocomplete panel
- suggestion rails
- faceted filters
- result card variants by content type
- zero-state and no-result states

### AI components

- prompt composer
- cited response block
- source chips
- ask-from-selection entry point
- topic explorer tree
- follow-up suggestions

### Offline components

- download manager item
- storage usage panel
- offline collection selector
- failed sync recovery card

## 9. Website Redesign

### Homepage

Purpose:

- orient users immediately
- surface Quran, Hadith, Books, Search, Audio, and AI
- re-entry into recent activity
- expose daily and topical content without turning into a news portal

Layout:

1. compact utility header
2. primary search bar as first-viewport utility
3. personalized re-entry row
4. domain grid: Quran, Hadith, Books, Audio, AI
5. daily guidance section
6. continue learning section
7. topical collections
8. download / offline awareness
9. footer

Do not use a marketing hero. Use the actual product as the first screen.

### Quran Home

Purpose:

- give users quick access to reading, listening, tafsir, memorization, and search

Modules:

- continue reading
- recent surahs
- popular surahs
- reciters
- reading modes
- memorization plans
- tafsir shortcuts

### Surah List

Use a structured list/grid toggle with:

- number
- Arabic name
- Bangla name
- English name
- revelation type
- verse count
- last-read progress
- quick actions: read, listen, bookmark

### Surah Reader

Desktop layout:

- left contextual rail for surah/chapter navigation
- center reading column
- right utility rail for translation toggles, tafsir, notes, audio, related items

Mobile layout:

- top sticky surah header
- bottom action bar
- bottom sheets for settings, tafsir, compare, audio queue

### Ayah Detail

A dedicated ayah permalink page should include:

- Arabic
- multiple translations
- transliteration optional
- word-by-word
- tafsir excerpt
- root / grammar if available
- audio segment
- cross-references
- notes and highlights
- share and copy actions

### Translation Comparison

Use a multi-column desktop layout and stacked mobile layout.

Support:

- Bangla translators
- English translators
- optional Arabic anchor row
- pin one translation
- compare diff by paragraph chunking, not raw sentence borders only

### Tafsir Page

Design as a reader, not a blog.

Structure:

- ayah anchor header
- tafsir source selector
- reading column
- citation notes
- related ayat
- next/previous ayah controls

### Hadith Home

Structure:

- continue last collection
- popular collections
- by authenticity grade
- by topic
- by narrator
- daily hadith
- study collections

### Hadith Reader

A hadith card must handle:

- Arabic matn
- Bangla translation
- English translation optional
- sanad / narrator line
- grade badge
- references
- commentary
- chapter and collection context
- share, bookmark, note

### Books section

Books should feel like a serious digital library:

- subject-driven browsing
- author pages
- edition metadata
- reading progress
- download availability
- related Quran/Hadith references

### Search

The search page is not a results dump. It should include:

- global omnibox
- content-type filters
- language filters
- exact/fuzzy toggle
- result clusters
- trending topics
- recent history
- keyboard navigation

### AI Assistant

The AI surface must feel accountable.

Rules:

- always cite sources
- clearly separate generated explanation from revealed text and canonical references
- provide “open source in reader” actions
- avoid chat bubble clutter; use a composed study assistant layout

### Bookmarks / Notes / Highlights / Collections

These should be a real personal study system:

- filter by source type
- group by collection
- sort by date, source, topic
- export and sync
- attach note to ayah/hadith/book paragraph

## 10. Android Redesign

### App architecture

Bottom nav:

- Home
- Quran
- Hadith
- Search
- Library

FAB only when context requires it, such as quick note or quick search.

### Home

Should prioritize:

- continue reading
- daily verse / hadith
- downloads status
- recent listening
- bookmarks and study plans

### Quran mobile reader

Requirements:

- thumb-friendly bottom actions
- smooth verse snapping optional
- compact sticky header
- offline-safe audio state
- translation visibility sheet
- reciter picker bottom sheet
- hold-to-select verse actions

### Hadith mobile reader

Requirements:

- chapter breadcrumbs
- grade emphasis
- expandable commentary
- narrator and source references in a collapsible block

### Tablet layout

Use two-pane and three-pane layouts:

- left navigation
- center content
- right study tools

### Widgets

Recommended widgets:

- daily ayah
- continue reading
- daily hadith
- audio resume

### Material You support

Use dynamic color only for secondary UI accents, never for core reading text or sacred content emphasis.

## 11. Best-in-Class Quran Experience

### Modes

Provide explicit modes:

- `Read`
- `Study`
- `Memorize`
- `Listen`
- `Focus`
- `Kids`

These should alter layout density and tool exposure, not just theme.

### Reader requirements

Include:

- Arabic script options
- Bangla translation options
- English translation options
- word-by-word
- transliteration toggle
- tafsir panel
- root and grammar drawer
- repeat and loop controls
- per-ayah quick actions
- persistent reading position
- reading goal tracker
- verse grouping for semantic reading
- audio sync highlighting
- auto-scroll optional

### Memorization mode

Should support:

- hide/show layers
- repeat one ayah
- repeat range
- delayed reveal
- tap to reveal translation
- record self-recitation later phase
- session stats

## 12. Hadith Experience

### Must-have structure

- collections
- books
- chapters
- hadith detail
- narrator info
- authenticity grade
- references
- commentary
- related hadith
- topic tags

### Design rules

- hadith cards can be denser than Quran cards
- grading should be visible but not loud
- references should be scannable
- chapter browsing should be very fast on mobile

## 13. Search System

### Search model

Build search as a cross-domain retrieval system, not one text box per feature.

Supported content:

- Quran
- Hadith
- Books
- Topics
- Names
- Narrators
- Scholars
- Collections
- Audio reciters

### Capabilities

- autocomplete
- typo tolerance
- Bangla normalization
- Arabic normalization
- transliteration-aware matching
- query understanding
- recent searches
- trending topics
- advanced filters
- keyboard navigation
- search landing shortcuts

### Search result ranking

Rank by:

1. exact reference match
2. exact title match
3. normalized text match
4. semantic popularity and recency signals
5. user history when signed in

## 14. Performance Plan

### Targets

- Lighthouse 95+ minimum, aim 100 on core marketing-light routes
- LCP under 2.5s on mid-tier mobile
- INP under 200ms
- CLS under 0.05

### Strategies

- static generation for reference-heavy pages
- ISR for frequently updated metadata pages
- route-level code splitting
- streamed server rendering
- virtualized lists for verses, hadith, books, results
- image optimization
- font subsetting
- edge caching for content pages
- offline bundle partitioning
- selective hydration

### Offline strategy

PWA should cache:

- shell
- recent reading surfaces
- bookmarked content
- selected offline packs

Android should support downloadable content packs by domain:

- Quran core
- selected tafsir
- selected hadith collections
- selected books
- audio downloads by reciter

## 15. Accessibility Plan

Target: `WCAG AA+`

### Core requirements

- full keyboard navigation on web
- visible focus on all actions
- semantic landmarks and heading order
- screen reader labels for Arabic controls and audio actions
- 44px minimum targets
- large text support
- reduced motion support
- no meaning conveyed by color alone
- dark mode contrast validation
- adjustable line height and font size for translations

### Arabic/Bangla considerations

- do not compress line height
- preserve correct directionality
- keep Arabic selection/copy robust
- ensure Bangla does not wrap into visually broken clusters

## 16. Animation System

Use Framer Motion sparingly.

### Allowed motion

- page fade/slide on route transitions
- card hover lift on web only
- bottom sheet transitions
- search suggestion reveal
- audio state transitions
- loading skeleton shimmer

### Avoid

- decorative floating effects on reading pages
- oversized parallax
- continuous ambient animations near Quran text

## 17. Dark Mode

The dark theme should be one of the product’s strongest differentiators.

Requirements:

- very high readability for Arabic
- warm-neutral contrast, not blue-heavy dark UI
- OLED mode optional
- reduced glare
- restrained accent usage
- comfortable late-night reading for long sessions

Recommended dark theme character:

- background near charcoal-green/ink
- surface slightly lifted
- Arabic text soft-white, not pure white
- translation text lower contrast but still AA-compliant
- gold accent for signals, not large filled areas

## 18. AI Features

### Productized AI modules

- Ask Quran
- Ask Hadith
- Topic Explorer
- Daily Wisdom
- Summaries
- Contextual explanation
- Cross-reference surfacing
- Study assistant
- voice query later phase

### Guardrails

- always cite source passages
- clearly mark generated text
- allow direct open-in-source navigation
- no uncited theological claims presented as authoritative text
- moderation and abuse controls

## 19. Modern Differentiating Features

Recommended features:

- daily verse and hadith widgets
- prayer reminder tie-ins
- reading streaks with humility-focused framing
- study plans
- recitation playlists
- family mode
- teacher collections
- mosque mode for display surfaces
- cross-device sync
- cloud backup
- annotation collections
- offline pack manager
- quick action app shortcuts

Do not gamify sacred reading too aggressively. Use progress gently.

## 20. Data and Backend Model Suggestions

### Core tables

- users
- profiles
- reading_history
- bookmarks
- highlights
- notes
- collections
- collection_items
- quran_surahs
- quran_ayahs
- quran_translations
- quran_tafsir_entries
- quran_word_segments
- hadith_collections
- hadith_books
- hadith_chapters
- hadith_entries
- hadith_grades
- hadith_narrators
- books
- book_chapters
- book_sections
- reciters
- audio_assets
- downloads
- search_synonyms
- topics
- topic_links

### Search indexing

Create separate search documents for:

- ayah
- hadith
- book passage
- topic page
- narrator page
- scholar page

## 21. API Architecture

Use domain-oriented modules:

- `/quran/*`
- `/hadith/*`
- `/books/*`
- `/search/*`
- `/audio/*`
- `/ai/*`
- `/library/*`
- `/users/*`
- `/sync/*`

Patterns:

- server-side pagination
- typed DTOs
- edge-friendly cache headers for public content
- auth only where needed

## 22. SEO Strategy

Critical for website growth in Bangladesh.

### Requirements

- indexable Surah pages
- indexable Ayah pages
- indexable Hadith pages
- structured metadata for books and topics
- canonical URLs
- Bengali metadata support
- schema.org where relevant
- internal linking between Quran, tafsir, hadith, and topics
- static text intros for content pages

## 23. Security Recommendations

- rate limit search and AI endpoints
- sanitize user-generated notes and content
- signed URLs for restricted downloads if needed
- audit logs for admin content changes
- secrets management via platform env vars
- CSP for web app
- secure local storage boundaries for mobile sensitive data

## 24. Deployment Plan

### Recommended deployment

- `Vercel` for web
- `Railway` or `Render` for API and background workers initially
- `Cloudflare` for CDN, DNS, caching, WAF
- `Postgres` managed instance
- `Redis` managed instance
- object storage for downloads/audio

## 25. GitHub Project Structure

Suggested repo migration:

```txt
apps/
  web/
  mobile/
  api/
packages/
  tokens/
  ui-web/
  ui-mobile/
  types/
  quran-domain/
  hadith-domain/
  search-contracts/
docs/
  product/
  architecture/
  decisions/
```

## 26. Delivery Roadmap

### Phase 1: Foundation MVP

- Next.js web shell
- design tokens
- Quran home
- Surah list
- Reader page
- bookmarks
- last read
- offline PWA shell
- search v1

### Phase 2: Product credibility

- Hadith domain
- better reader settings
- audio system redesign
- notes/highlights
- Android app foundation
- sync/account

### Phase 3: Study platform

- tafsir
- translation comparison
- collections
- AI with citations
- books library
- advanced search

### Phase 4: Differentiation

- widgets
- teacher/family mode
- memorization analytics
- offline pack manager
- cross-device sync
- deep personalization

## 27. Concrete Recommendation for Your Project

If the goal is to become the best Bengali Islamic platform, do this:

1. Stop extending the single-file HTML app as the main long-term platform.
2. Preserve its Quran data model, offline lessons, and feature logic as migration input.
3. Rebuild on a monorepo with Next.js web, NestJS API, React Native Android, and shared domain packages.
4. Make Quran and Hadith equal first-class product domains from the start.
5. Make search the central product capability, not a utility page.
6. Use Bangla-first typography and reading ergonomics as a competitive advantage.
7. Treat the reading surface with more restraint than the current glass-heavy dashboard styling.

## 28. What I Would Build First

The highest-value first implementation is:

- monorepo scaffold
- design tokens
- web app shell
- homepage
- Quran home
- Surah list
- premium reader
- search omnibox
- dark mode
- PWA offline base

That gives you a serious product foundation instead of another style pass.
