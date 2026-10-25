'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  SHARE_CARD_HEIGHT as HEIGHT,
  SHARE_CARD_WIDTH as WIDTH,
  SHARE_THEMES as THEMES,
  drawShareFrame,
  resolveShareFonts,
  wrapText,
  type ShareThemeKey as ThemeKey,
} from '@/lib/share-card';

export interface ShareAyahData {
  surahName: string;
  surahEnglishName: string;
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  bangla: string;
  english: string;
}

function drawCard(canvas: HTMLCanvasElement, data: ShareAyahData, theme: ThemeKey) {
  const fam = resolveShareFonts();
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const p = drawShareFrame(ctx, theme);

  const centre = WIDTH / 2;
  const maxWidth = WIDTH - 220;
  let y = 170;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.fillStyle = p.accent;
  ctx.font = `600 34px ${fam.ui}`;
  ctx.fillText(`${data.surahEnglishName} · ${data.surahNumber}:${data.verseNumber}`, centre, y);
  y += 90;

  // Arabic, right-to-left, drawn with the app's Arabic face.
  ctx.direction = 'rtl';
  ctx.fillStyle = p.ink;
  ctx.font = `400 64px ${fam.arabic}`;
  const arabicLines = wrapText(ctx, data.arabic, maxWidth);
  for (const line of arabicLines) {
    ctx.fillText(line, centre, y);
    y += 110;
  }
  ctx.direction = 'ltr';
  y += 40;

  ctx.fillStyle = p.ink;
  ctx.font = `400 40px ${fam.bengali}`;
  for (const line of wrapText(ctx, data.bangla, maxWidth)) {
    ctx.fillText(line, centre, y);
    y += 64;
  }
  y += 36;

  ctx.fillStyle = p.muted;
  ctx.font = `italic 32px ${fam.ui}`;
  for (const line of wrapText(ctx, `"${data.english}"`, maxWidth)) {
    ctx.fillText(line, centre, y);
    y += 46;
  }

  // Footer
  ctx.fillStyle = p.accent;
  ctx.font = `600 28px ${fam.ui}`;
  ctx.fillText('Al Quran · আল কুরআন', centre, HEIGHT - 150);
}

export function ShareAyahModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: ShareAyahData | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<ThemeKey>('parchment');
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!isOpen || !data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    // Wait for the web fonts so the card uses the real faces, not fallbacks.
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    const render = () => {
      drawCard(canvas, data, theme);
      canvas.toBlob((b) => setBlob(b), 'image/png');
    };
    if (fonts) {
      fonts.ready.then(render);
    } else {
      render();
    }
  }, [isOpen, data, theme]);

  if (!data) return null;

  const filename = `alquran-${data.surahNumber}-${data.verseNumber}-${theme}.png`;

  const download = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: filename });
      } catch {
        /* user dismissed the share sheet */
      }
    } else {
      download();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share ayah" size="lg">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Theme">
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={theme === key}
              onClick={() => setTheme(key)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                theme === key
                  ? 'bg-forest text-forest-ink border-transparent'
                  : 'border-gold-line text-text-muted hover:bg-surface-highlight'
              }`}
            >
              {THEMES[key].label}
            </button>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-xl border border-gold-line"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          aria-label="Ayah share card preview"
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={download} disabled={!blob}>
            Download PNG
          </Button>
          <Button variant="primary" onClick={share} disabled={!blob}>
            Share
          </Button>
        </div>
      </div>
    </Modal>
  );
}
