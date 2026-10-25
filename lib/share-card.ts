// Shared canvas helpers for the share-image cards (ayah + hadith).
// Kept framework-free so any share modal can draw the same framed card.

export type ShareThemeKey = 'parchment' | 'forest' | 'umber';

export interface SharePalette {
  label: string;
  bg: string;
  ink: string;
  muted: string;
  accent: string;
}

// Colours come from the design system in app/globals.css (light, forest, dark).
export const SHARE_THEMES: Record<ShareThemeKey, SharePalette> = {
  parchment: {
    label: 'Parchment',
    bg: '#F7F2E7',
    ink: '#1B1A17',
    muted: '#5E5A50',
    accent: '#7A5F1F',
  },
  forest: {
    label: 'Forest & Gold',
    bg: '#0B1F1A',
    ink: '#E9E4D8',
    muted: '#C9B98A',
    accent: '#D9B96A',
  },
  umber: {
    label: 'Midnight Umber',
    bg: '#1A1814',
    ink: '#F2EDE0',
    muted: '#B0A896',
    accent: '#E3C98D',
  },
};

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

export interface ShareFonts {
  ui: string;
  arabic: string;
  bengali: string;
}

/** Greedy word wrap that measures with the canvas context's current font. */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Canvas font strings do not accept CSS custom properties, so resolve the app's
 * font variables to their concrete family names first.
 */
export function resolveShareFonts(): ShareFonts {
  const style = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) => {
    const value = style.getPropertyValue(name).trim();
    return value || fallback;
  };
  return {
    ui: pick('--font-ui', 'sans-serif'),
    arabic: pick('--font-arabic', 'serif'),
    bengali: pick('--font-bengali-ui', 'sans-serif'),
  };
}

/** Paints the card background and the gold hairline frame. */
export function drawShareFrame(
  ctx: CanvasRenderingContext2D,
  theme: ShareThemeKey
): SharePalette {
  const palette = SHARE_THEMES[theme];
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, SHARE_CARD_WIDTH - 96, SHARE_CARD_HEIGHT - 96);
  ctx.globalAlpha = 1;

  return palette;
}

/**
 * Picks a body size for a passage: `sizes` is ordered largest → smallest, so
 * longer text steps down to a smaller face and fewer lines.
 */
export function bodyFontSize(length: number, sizes: number[]): number {
  const tiers = [220, 500, 900];
  const index = tiers.findIndex((limit) => length <= limit);
  const tier = index === -1 ? sizes.length - 1 : index;
  return sizes[Math.min(tier, sizes.length - 1)];
}

/**
 * Fits text into at most `maxLines` at one font size, ellipsizing the last
 * line when the passage is longer than the card can hold.
 */
export function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  {
    maxWidth,
    maxLines,
    size,
    font,
    lineHeight,
  }: {
    maxWidth: number;
    maxLines: number;
    size: number;
    font: (size: number) => string;
    lineHeight: number;
  }
): { lines: string[]; truncated: boolean } {
  ctx.font = font(size);
  const all = wrapText(ctx, text.replace(/\s+/g, ' ').trim(), maxWidth);
  if (all.length <= maxLines) return { lines: all, truncated: false };

  const kept = all.slice(0, maxLines);
  let last = kept[kept.length - 1] ?? '';
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
    last = last.slice(0, -1);
  }
  kept[kept.length - 1] = `${last.trimEnd()}…`;
  return { lines: kept, truncated: true };
}
