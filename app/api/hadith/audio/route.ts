import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory cache for synthesized hadith audio chunks (up to 250 entries)
const audioCache = new Map<string, Buffer>();

function cleanBengaliForSpeech(text: string): string {
  let cleaned = text;

  // 1. Expand religious abbreviations & honorifics before removing parens
  cleaned = cleaned
    .replace(/\s*\(\s*(?:রাঃ|রা:|রা\.|রাযি\.|রাযিঃ|রাযিয়াল্লাহু আনহু|রাদ্বিয়াল্লাহু আনহু|রাযি)\s*\)/g, ' রাদিয়াল্লাহু আনহু')
    .replace(/\b(?:রাঃ|রাযিঃ)\b/g, 'রাদিয়াল্লাহু আনহু')
    .replace(/\s*\(\s*(?:রহঃ|রহ:|রহ\.|রহমাতুল্লাহি আলাইহি|রহ)\s*\)/g, ' রহমাতুল্লাহি আলাইহি')
    .replace(/\b(?:রহঃ)\b/g, 'রহমাতুল্লাহি আলাইহি')
    .replace(/\s*\(\s*(?:সাঃ|সা:|সা\.|দঃ|দ\.|সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম|সা)\s*\)/g, ' সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম')
    .replace(/\b(?:সাঃ|দঃ)\b/g, 'সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম')
    .replace(/\s*\(\s*(?:আঃ|আ:|আ\.|আলাইহিস সালাম|আ)\s*\)/g, ' আলাইহিস সালাম')
    .replace(/\b(?:আঃ)\b/g, 'আলাইহিস সালাম');

  // 2. Remove publication / publisher citations at the end of hadiths
  cleaned = cleaned
    .replace(/\([০-৯0-9\/,\s:\-–—\.\u0980-\u09FF]*(?:মুসলিম|বুখারী|তিরমিযী|নাসাঈ|আহমদ|ইবনু|প্রকাশনী|ফাউন্ডেশন|তাওহীদ|হাঃ|হাদিস|পর্ব)[০-৯0-9\/,\s:\-–—\.\u0980-\u09FF]*\)/gi, '')
    // Remove standalone bracketed numbers like (১৪৮১), (২৯৩৪ শেষাংশ)
    .replace(/\([০-৯0-9\s,\-\/–—\.শেportionsশেষাংশ]+\)/g, '');

  // 3. Normalize Arabic transliteration ayn/hamzah characters that cause speech engine pauses
  cleaned = cleaned
    .replace(/তা‘আলা/g, 'তাআলা')
    .replace(/সা‘ঈদ/g, 'সাঈদ')
    .replace(/সা‘ঈদী/g, 'সাঈদী')
    .replace(/নু‘মান/g, 'নুমান')
    .replace(/মু‘আয/g, 'মুআয')
    .replace(/কুর্‘আন|কুর‘আন/g, 'কুরআন')
    .replace(/বিদ‘আত/g, 'বিদআত')
    .replace(/‘উমার/g, 'উমর')
    .replace(/‘আমর/g, 'আমর')
    .replace(/‘আলী/g, 'আলী')
    .replace(/‘আবদুল্লাহ/g, 'আবদুল্লাহ')
    .replace(/‘উসমান/g, 'উসমান')
    .replace(/‘আব্বাস/g, 'আব্বাস')
    .replace(/‘আয়িশা|‘আইশা/g, 'আয়েশা')
    .replace(/‘উবাইদাহ/g, 'উবাইদাহ')
    .replace(/মুগীরাহ/g, 'মুগিরা')
    .replace(/হুরমুযান/g, 'হুরমুযান')
    // Remove any remaining standalone single/double quotation marks
    .replace(/[‘'’`]/g, '');

  // 4. Remove brackets, brackets symbols, dashes, slashes that speech engines vocalize
  cleaned = cleaned
    .replace(/["“”«»]/g, ' ')
    .replace(/[\(\)\[\]{}<>\/\\–—\-_=+*#~]/g, ' ')
    // Replace colon / bisarga punctuation with natural pause
    .replace(/[:ঃ]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function cleanArabicForSpeech(text: string): string {
  let cleaned = text;

  // Remove non-Arabic footnotes, numbers, Latin letters, brackets
  cleaned = cleaned
    .replace(/[\(\)\[\]{}«»"“”]/g, ' ')
    .replace(/[0-9\u0660-\u0669]/g, ' ')
    .replace(/[a-zA-Z]/g, ' ')
    .replace(/[\\\/–—\-_=+*#~]/g, ' ')
    .replace(/[‘'’`]/g, '')
    // Normalize colons to Arabic comma for natural phrasing
    .replace(/[:]/g, '، ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function cleanTextForSpeech(text: string, lang: string): string {
  if (!text) return '';
  if (lang === 'bn') return cleanBengaliForSpeech(text);
  if (lang === 'ar') return cleanArabicForSpeech(text);

  // English
  return text
    .replace(/\([0-9\s,\-\/:]+\)/g, '')
    .replace(/[‘'’`"“”]/g, '')
    .replace(/[\(\)\[\]{}<>\/\\–—\-_=+*#~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into small chunks suitable for TTS (max ~180 chars)
 * respecting punctuation marks to prevent cutting words.
 */
function splitIntoChunks(text: string, lang: string, maxLen = 175): string[] {
  if (text.length <= maxLen) return [text];

  const regex = lang === 'ar' ? /[^،؛.!?\n]+[،؛.!?\n]?/g : /[^।?!.,;\n]+[।?!.,;\n]?/g;
  const sentences = text.match(regex) || [text];
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

    // Check in-memory cache
    const cacheKey = crypto.createHash('md5').update(`${lang}:${cleaned}`).digest('hex');
    const cachedBuffer = audioCache.get(cacheKey);
    if (cachedBuffer) {
      return new NextResponse(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cachedBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'X-Audio-Cache': 'HIT',
        },
      });
    }

    const ttsLang = lang === 'ar' ? 'ar' : lang === 'bn' ? 'bn' : 'en';
    const chunks = splitIntoChunks(cleaned, lang, 175);

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

    // Save to cache (evict oldest if size > 250)
    if (audioCache.size >= 250) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, combined);

    return new NextResponse(new Uint8Array(combined), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Audio-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Hadith TTS Error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
