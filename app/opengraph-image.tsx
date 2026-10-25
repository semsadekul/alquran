import { ImageResponse } from 'next/og';

// Edge runtime: the Node build of @vercel/og fails to resolve its bundled
// WASM on Windows checkouts, which breaks `next build` locally.
export const runtime = 'edge';

// Rendered as a real PNG (1200×630) at build time so chat apps and social
// previews that cannot render SVG still get a share image.
export const alt = 'Al Quran — read, listen and memorise';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf7f0',
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(184,150,74,0.18), transparent 55%), radial-gradient(circle at 85% 85%, rgba(184,150,74,0.14), transparent 50%)',
          padding: 64,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: '2px solid rgba(184,150,74,0.55)',
            borderRadius: 32,
            padding: 56,
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: '#8a6d2f',
              marginBottom: 28,
            }}
          >
            The Holy Quran
          </div>
          <div
            style={{
              fontSize: 116,
              fontWeight: 700,
              color: '#2f2a22',
              lineHeight: 1.05,
              marginBottom: 28,
            }}
          >
            Al Quran
          </div>
          <div
            style={{
              fontSize: 34,
              color: '#5c5446',
              textAlign: 'center',
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            Read in Arabic, Bengali and English · Listen · Memorise offline
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginTop: 44,
              fontSize: 24,
              color: '#8a6d2f',
            }}
          >
            <span>114 surahs</span>
            <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#b8964a' }} />
            <span>6,236 ayahs</span>
            <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#b8964a' }} />
            <span>Free, ad-free reader</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
