'use client';

import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/providers/LocaleProvider';
import { banglaOnly } from '@/lib/hadith-text';
import {
  SHARE_CARD_HEIGHT as HEIGHT,
  SHARE_CARD_WIDTH as WIDTH,
  SHARE_THEMES,
  bodyFontSize,
  drawShareFrame,
  fitLines,
  resolveShareFonts,
  type ShareThemeKey,
} from '@/lib/share-card';

export interface ShareHadithData {
  book: string;
  bookTitleBn: string;
  hadithNumber: number;
  chapterNameBn: string;
  arabic?: string;
  bangla: string;
  grades?: Array<{ name: string; grade: string }>;
}

function gradeLabel(hadith: ShareHadithData): string | null {
  if (hadith.book === 'bukhari' || hadith.book === 'muslim') {
    return 'সহীহ (শতভাগ বিশুদ্ধ)';
  }
  const first = hadith.grades && hadith.grades.length > 0 ? hadith.grades[0] : null;
  return first ? `তাহকীক: ${first.grade}${first.name ? ` (${first.name})` : ''}` : null;
}

function drawCard(canvas: HTMLCanvasElement, hadith: ShareHadithData, theme: ShareThemeKey) {
  const fam = resolveShareFonts();
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const p = drawShareFrame(ctx, theme);
  const centre = WIDTH / 2;
  const maxWidth = WIDTH - 220;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Source · hadith number, then the chapter it belongs to.
  ctx.fillStyle = p.accent;
  ctx.font = `600 34px ${fam.bengali}`;
  ctx.fillText(hadith.bookTitleBn, centre, 150);

  ctx.fillStyle = p.muted;
  ctx.font = `500 26px ${fam.bengali}`;
  const meta = `হাদিস ${hadith.hadithNumber} · ${hadith.chapterNameBn}`;
  const metaBlock = fitLines(ctx, meta, {
    maxWidth,
    maxLines: 1,
    size: 26,
    font: (s) => `500 ${s}px ${fam.bengali}`,
    lineHeight: 36,
  });
  ctx.fillText(metaBlock.lines[0] ?? meta, centre, 200);

  let y = 272;

  // Arabic matn, right-to-left.
  const arabic = (hadith.arabic || '').trim();
  if (arabic) {
    const size = bodyFontSize(arabic.length, [50, 44, 38, 34]);
    const lineHeight = Math.round(size * 1.6);
    const block = fitLines(ctx, arabic, {
      maxWidth,
      maxLines: 5,
      size,
      font: (s) => `400 ${s}px ${fam.arabic}`,
      lineHeight,
    });
    ctx.direction = 'rtl';
    ctx.fillStyle = p.ink;
    for (const line of block.lines) {
      ctx.fillText(line, centre, y);
      y += lineHeight;
    }
    ctx.direction = 'ltr';

    y += 22;
    ctx.fillStyle = p.accent;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(centre - 90, y, 180, 2);
    ctx.globalAlpha = 1;
    y += 32;
  }

  // Bangla translation — Arabic quotations are dropped here because the card
  // already shows the matn, and the layout is single-script. Truncates with an
  // ellipsis when the passage is long.
  const translation = banglaOnly(hadith.bangla) || hadith.bangla;
  const bottomLimit = HEIGHT - 260;
  const size = bodyFontSize(translation.length, [40, 36, 32, 28]);
  const lineHeight = Math.round(size * 1.55);
  const maxLines = Math.max(2, Math.floor((bottomLimit - y) / lineHeight));
  const block = fitLines(ctx, translation, {
    maxWidth,
    maxLines,
    size,
    font: (s) => `400 ${s}px ${fam.bengali}`,
    lineHeight,
  });
  ctx.fillStyle = p.ink;
  for (const line of block.lines) {
    ctx.fillText(line, centre, y);
    y += lineHeight;
  }

  // Authenticity grade + brand footer.
  const grade = gradeLabel(hadith);
  if (grade) {
    ctx.fillStyle = p.accent;
    ctx.font = `600 26px ${fam.bengali}`;
    ctx.fillText(grade, centre, HEIGHT - 212);
  }

  ctx.fillStyle = p.accent;
  ctx.font = `600 28px ${fam.ui}`;
  ctx.fillText('Al Quran · আল কুরআন', centre, HEIGHT - 150);
}

export function ShareHadithModal({
  isOpen,
  onClose,
  hadith,
}: {
  isOpen: boolean;
  onClose: () => void;
  hadith: ShareHadithData | null;
}) {
  const intl = useIntl();
  const { locale } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<ShareThemeKey>('parchment');
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!isOpen || !hadith || !canvasRef.current) return;
    const canvas = canvasRef.current;
    // Wait for the web fonts so the card uses the real faces, not fallbacks.
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    const render = () => {
      drawCard(canvas, hadith, theme);
      canvas.toBlob((b) => setBlob(b), 'image/png');
    };
    if (fonts) {
      fonts.ready.then(render);
    } else {
      render();
    }
  }, [isOpen, hadith, theme]);

  if (!hadith) return null;

  const filename = `alquran-hadith-${hadith.book}-${hadith.hadithNumber}-${theme}.png`;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={intl.formatMessage({ id: 'hadith.shareCardTitle' })}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Theme">
          {(Object.keys(SHARE_THEMES) as ShareThemeKey[]).map((key) => (
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
              {SHARE_THEMES[key].label}
            </button>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-xl border border-gold-line"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          aria-label="Hadith share card preview"
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={download} disabled={!blob}>
            {intl.formatMessage({ id: 'hadith.downloadPng' })}
          </Button>
          <Button variant="primary" onClick={share} disabled={!blob}>
            {intl.formatMessage({ id: 'hadith.share' })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
