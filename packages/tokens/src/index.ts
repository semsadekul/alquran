// -- Brand Colors -- Updated Premium Majestic Palette
export const brand = {
  moss: {
    900: '#072b1b',
    850: '#0a3622',     // Primary dark green
    800: '#0f4a30',
    700: '#145338',     // Mid green
    600: '#1a5e3f',
    500: '#2b7a52',     // Action green
    400: '#4a9a6e',
    300: '#7abf96',
    200: '#b8dfc8',
    100: '#e2f3ea',
    50:  '#f0f9f4',
  },
  gold: {
    700: '#8b6914',
    600: '#a8843e',     // Dark gold
    500: '#c5a059',     // Primary gold accent
    400: '#d4b06a',
    300: '#e2c275',     // Light gold
    200: '#f2e4b8',
    100: '#faf3e0',
  },
  ink: {
    950: '#060d10',
    900: '#0b1114',
    850: '#0f171b',
    800: '#121a1f',
    750: '#162127',
    700: '#1a262d',
    600: '#26343d',
    500: '#3a4d58',
    400: '#5a707d',
  },
  stone: {
    50:  '#f8f6f0',     // Warm off-white cream
    100: '#f1ebd9',
    200: '#e2e7e3',
    300: '#ced5cf',
    400: '#a8b2ab',
  },
} as const;

// -- Semantic Theme Tokens -- Updated with Premium Majestic palette
export const colors = {
  dark: {
    background:       '#072b1b',
    backgroundSubtle: '#0a3622',
    surface:          '#0f4a30',
    surfaceMuted:     '#145338',
    surfaceElevated:  '#1a5e3f',
    surfaceHover:     'rgba(255, 255, 255, 0.05)',
    border:           '#145338',
    borderSubtle:     'rgba(255, 255, 255, 0.08)',
    borderFocus:      '#e2c275',
    textPrimary:      '#f8f6f0',
    textSecondary:    '#e2e8f0',
    textMuted:        '#cbd5e1',
    textFaint:        '#94a3b8',
    accent:           '#c5a059',     // Gold accent
    accentHover:      '#e2c275',
    accentSubtle:     'rgba(197, 160, 89, 0.16)',
    accentWarm:       '#e2c275',
    accentWarmSubtle: 'rgba(226, 194, 117, 0.12)',
    success:          '#1f8a5b',
    warning:          '#c58a1c',
    danger:           '#c64f4f',
    info:             '#2f7cc2',
    overlay:          'rgba(0, 0, 0, 0.7)',
    glass:            'rgba(7, 43, 27, 0.92)',
    arabicText:       '#f8f6f0',
    activeVerse:      'rgba(197, 160, 89, 0.1)',
    activeBorder:     'rgba(197, 160, 89, 0.4)',
  },
  light: {
    background:       '#f8f6f0',     // Warm cream
    backgroundSubtle: '#f1ebd9',
    surface:          '#ffffff',
    surfaceMuted:     '#f8f6f0',
    surfaceElevated:  '#ffffff',
    surfaceHover:     'rgba(0, 0, 0, 0.03)',
    border:           '#e2e7e3',
    borderSubtle:     'rgba(0, 0, 0, 0.06)',
    borderFocus:      '#0a3622',
    textPrimary:      '#0a3622',     // Deep green text
    textSecondary:    '#2d3748',
    textMuted:        '#4a5a52',
    textFaint:        '#718096',
    accent:           '#0a3622',     // Deep green accent
    accentHover:      '#145338',
    accentSubtle:     'rgba(10, 54, 34, 0.1)',
    accentWarm:       '#c5a059',     // Gold accent
    accentWarmSubtle: 'rgba(197, 160, 89, 0.08)',
    success:          '#1f8a5b',
    warning:          '#c58a1c',
    danger:           '#c64f4f',
    info:             '#2f7cc2',
    overlay:          'rgba(0, 0, 0, 0.4)',
    glass:            'rgba(248, 246, 240, 0.92)',
    arabicText:       '#0a3622',
    activeVerse:      'rgba(197, 160, 89, 0.06)',
    activeBorder:     'rgba(197, 160, 89, 0.2)',
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
  glow:     '0 0 40px rgba(197, 160, 89, 0.12)',
  inner:    'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  audioBar: '0 -8px 32px rgba(0, 0, 0, 0.24)',
} as const;

// -- Typography Scale --
export const typography = {
  fonts: {
    sans:      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    arabic:    "'Noto Naskh Arabic', 'KFGQPC Uthmanic Script', 'Traditional Arabic', serif",
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
