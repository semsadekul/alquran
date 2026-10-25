import { NextRequest, NextResponse } from 'next/server';

function cleanTextForSpeech(text: string, lang: string): string {
  if (!text) return '';

  if (lang === 'bn') {
    return text
      // Replace abbreviations with natural spoken words
      .replace(/\(রাযি\.\)/g, 'রাদিআল্লাহু আনহু')
      .replace(/\(রহ\.\)/g, 'রহমাতুল্লাহি আলাইহি')
      .replace(/\(সা\.\)/g, 'সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম')
      .replace(/\(আ\.\)/g, 'আলাইহিস সালাম')
      // Remove publisher/book citations at the end in parentheses (e.g., মুসলিম ৩/৫০, হাঃ ৩২২, আধুনিক প্রকাশনী...)
      .replace(/\([০-৯0-9\/,\s:\-–—\.\u0980-\u09FF]*(?:মুসলিম|বুখারী|তিরমিযী|নাসাঈ|আহমদ|ইবনু|প্রকাশনী|ফাউন্ডেশন|হাঃ)[০-৯0-9\/,\s:\-–—\.\u0980-\u09FF]*\)/g, '')
      // Remove any remaining bracketed numbers like (১), (২)
      .replace(/\([০-৯0-9\s,\-\/]+\)/g, '')
      // Remove brackets, dashes, quotes that speech engines read aloud
      .replace(/[‘'"`“”]/g, '')
      .replace(/[\(\)\[\]{}<>\/\\–—\-_=+*#~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (lang === 'ar') {
    return text
      // Remove numbers, bracketed footnote citations
      .replace(/[\(\)\[\]{}0-9\u0660-\u0669]/g, ' ')
      .replace(/[‘'"`“”]/g, '')
      .replace(/[\/\\–—\-_=+*#~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // English
  return text
    .replace(/\([0-9\s,\-\/:]+\)/g, '')
    .replace(/[‘'"`“”]/g, '')
    .replace(/[\(\)\[\]{}<>\/\\–—\-_=+*#~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into small chunks suitable for TTS (max ~180 chars)
 */
function splitIntoChunks(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^।?!.,;\n]+[।?!.,;\n]?/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 <= maxLen) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLen) {
        // Fallback: split long sentences by words
        const words = trimmed.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if (sub.length + w.length + 1 <= maxLen) {
            sub = sub ? `${sub} ${w}` : w;
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = 'ar' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleaned = cleanTextForSpeech(text, lang);
    if (!cleaned) {
      return NextResponse.json({ error: 'Cleaned text is empty' }, { status: 400 });
    }

    const ttsLang = lang === 'ar' ? 'ar' : lang === 'bn' ? 'bn' : 'en';
    const chunks = splitIntoChunks(cleaned, 180);

    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(
        chunk
      )}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        throw new Error(`Google TTS returned ${res.status}`);
      }

      const arrayBuf = await res.arrayBuffer();
      buffers.push(Buffer.from(arrayBuf));
    }

    const combined = Buffer.concat(buffers);

    return new NextResponse(combined, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Hadith TTS Error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
