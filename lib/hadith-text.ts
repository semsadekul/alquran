// The Bengali hadith editions quote the Qur'anic verse in Arabic inside the
// Bengali translation (e.g. "…(وَإِنْ كُنْتُمْ جُنُبًا فَاطَّهَّرُوا)…"). Splitting the
// text by script lets the reader render those runs with the Arabic face and an
// RTL direction instead of as Bengali-font text.

export interface HadithTextSegment {
  text: string;
  arabic: boolean;
}

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const PUNCTUATION_ONLY = /^[\s()[\]{}«»‹›،؛؟.:!?,;'"—–-]*$/;
const TRAILING_PUNCTUATION = /[\s([{«‹›]+$/;
const LEADING_PUNCTUATION = /^[\s)\]}{»‹›،؛؟.:!?,;'"—–-]+/;

export function hasArabicScript(text: string): boolean {
  return ARABIC_CHAR.test(text);
}

function isArabicChar(char: string): boolean {
  return ARABIC_CHAR.test(char);
}

/** Splits mixed Bengali/Arabic text into script runs, keeping brackets with the Arabic quote. */
export function splitByScript(text: string): HadithTextSegment[] {
  const raw: HadithTextSegment[] = [];
  let buffer = '';
  let bufferIsArabic: boolean | null = null;

  for (const char of text) {
    const isArabic = isArabicChar(char);
    if (bufferIsArabic === null || isArabic === bufferIsArabic) {
      buffer += char;
      bufferIsArabic = isArabic;
      continue;
    }
    raw.push({ text: buffer, arabic: bufferIsArabic });
    buffer = char;
    bufferIsArabic = isArabic;
  }
  if (buffer) raw.push({ text: buffer, arabic: bufferIsArabic === true });

  // Fold punctuation-only gaps into the neighbouring Arabic run.
  const folded: HadithTextSegment[] = [];
  for (const segment of raw) {
    const previous = folded[folded.length - 1];
    if (!segment.arabic && previous && previous.arabic && PUNCTUATION_ONLY.test(segment.text)) {
      previous.text += segment.text;
      continue;
    }
    folded.push({ ...segment });
  }

  // Folding a space back into a quote can leave two Arabic runs side by side.
  const merged: HadithTextSegment[] = [];
  for (const segment of folded) {
    const previous = merged[merged.length - 1];
    if (previous && previous.arabic === segment.arabic) {
      previous.text += segment.text;
      continue;
    }
    merged.push({ ...segment });
  }

  // Pull an opening bracket (or trailing space) into the quote that follows it.
  for (let i = 1; i < merged.length; i += 1) {
    if (!merged[i].arabic || merged[i - 1].arabic) continue;
    const match = merged[i - 1].text.match(TRAILING_PUNCTUATION);
    if (!match) continue;
    merged[i].text = match[0] + merged[i].text;
    merged[i - 1].text = merged[i - 1].text.slice(0, -match[0].length);
  }

  // And the closing bracket that follows a quote.
  for (let i = 0; i < merged.length - 1; i += 1) {
    if (!merged[i].arabic || merged[i + 1].arabic) continue;
    const match = merged[i + 1].text.match(LEADING_PUNCTUATION);
    if (!match) continue;
    merged[i].text += match[0];
    merged[i + 1].text = merged[i + 1].text.slice(match[0].length);
  }

  return merged.filter((segment) => segment.arabic || segment.text.trim());
}

/** Bengali-only text, used where a compact preview or an image card is drawn. */
export function banglaOnly(text: string): string {
  return splitByScript(text)
    .filter((segment) => !segment.arabic)
    .map((segment) => segment.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
