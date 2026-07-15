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
