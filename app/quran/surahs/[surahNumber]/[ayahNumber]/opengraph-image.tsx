import { ImageResponse } from 'next/og';
import { promises as fs } from 'fs';
import path from 'path';
import { getSurah } from '@/lib/data/quran';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: {
    surahNumber: string;
    ayahNumber: string;
  };
}

export default async function Image({ params }: Props) {
  const surahNum = parseInt(params.surahNumber, 10);
  const ayahNum = parseInt(params.ayahNumber, 10);
  const surah = getSurah(surahNum);

  let arabicText = '';
  let englishText = '';
  let banglaText = '';

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'verses', `${surahNum}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    const found = data.ayahs?.find((a: { number: number }) => a.number === ayahNum);
    if (found) {
      arabicText = found.arabic || '';
      englishText = found.english || '';
      banglaText = found.bangla || '';
    }
  } catch {
    /* fallback */
  }

  // Gracefully truncate long verses for 1200x630 card
  const displayArabic =
    arabicText.length > 180 ? arabicText.slice(0, 180) + '...' : arabicText;
  const displayTranslation =
    englishText.length > 140 ? englishText.slice(0, 140) + '...' : englishText;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0B1F1A',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #16362F 0%, #0B1F1A 85%)',
          border: '14px solid #D4AF37',
          padding: '48px 60px',
          color: '#FFFDF8',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '9999px',
              padding: '8px 24px',
            }}
          >
            <span style={{ color: '#D4AF37', fontSize: '20px', fontWeight: 700 }}>
              Al Quran · আল কুরআন
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#E6C875', fontSize: '24px', fontWeight: 700 }}>
              Surah {surah?.englishName ?? surahNum} ({surahNum}:{ayahNum})
            </span>
          </div>
        </div>

        {/* Center: Arabic Calligraphy Text */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            maxWidth: '1040px',
            margin: '24px 0',
          }}
        >
          <p
            dir="rtl"
            style={{
              fontSize: displayArabic.length > 100 ? '36px' : '44px',
              fontWeight: 700,
              color: '#FFFDF8',
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {displayArabic}
          </p>
        </div>

        {/* Bottom Translation & Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '8px',
          }}
        >
          {displayTranslation && (
            <p
              style={{
                fontSize: '20px',
                color: '#D1CBBF',
                textAlign: 'center',
                fontStyle: 'italic',
                maxWidth: '960px',
                lineHeight: 1.4,
              }}
            >
              &ldquo;{displayTranslation}&rdquo;
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '12px',
              fontSize: '14px',
              color: '#D4AF37',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            <span>100% Free</span>
            <span>&bull;</span>
            <span>Ad-Free</span>
            <span>&bull;</span>
            <span>alquran.insforge.site</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
