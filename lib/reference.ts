import { getSurahs, type Surah } from '@/lib/data/quran';

export interface AyahReference {
  surah: Surah;
  ayah: number;
}

/**
 * Converts Arabic-Indic (٠–٩), Eastern Arabic-Indic / Bangla (০–৯) digits to ASCII
 * so a reference typed in any script parses the same way.
 */
export function normaliseDigits(input: string): string {
  return input.replace(/[\u0660-\u0669\u06F0-\u06F9\u09E6-\u09EF]/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
    return String(code - 0x09e6);
  });
}

/**
 * Parses a reference such as "2:255", "2 255", "2-255", "baqarah 255" or
 * "বাকারা ২৫৫". Returns null when the text is not a reference or points at an
 * ayah that does not exist in the surah.
 */
export function parseAyahReference(query: string): AyahReference | null {
  const text = normaliseDigits(query).trim();
  if (!text) return null;

  const match = text.match(/^(.*?)\s*[:\s-]\s*(\d{1,3})$/);
  if (!match) return null;

  const [, head, ayahText] = match;
  const ayah = Number(ayahText);
  if (!Number.isInteger(ayah) || ayah < 1) return null;

  const surah = resolveSurah(head.trim());
  if (!surah || ayah > surah.numberOfAyahs) return null;

  return { surah, ayah };
}

/**
 * Folds Bangla spelling variants so one typed form can match the stored name.
 *
 * The stored names use conjuncts (juktakkhor), e.g. "আল-বাক্বারাহ", while readers
 * commonly type the plain form "বাকারা". Dropping the hasanta together with the
 * consonant it joins collapses those back to the same skeleton:
 *   বাক্বারাহ → বাকারাহ
 * It also removes the nukta (য়/ড়/ঢ়) and a leading "সূরা", which people often type.
 */
export function foldBangla(input: string): string {
  return input
    .replace(/^সূরা|^সুরা|^surah/i, '')
    .replace(/[\u09CD]./g, '')   // hasanta + the consonant it joins
    .replace(/[\u09CD]/g, '')    // trailing hasanta
    .replace(/[\u09BC]/g, '')    // nukta
    .replace(/[\s'`\-]/g, '');
}

/** Resolves a surah from a number, an English name or a Bangla name. */
function resolveSurah(head: string): Surah | null {
  if (!head) return null;

  if (/^\d{1,3}$/.test(head)) {
    const number = Number(head);
    return getSurahs().find((s) => s.number === number) ?? null;
  }

  const needle = head.toLowerCase().replace(/[\s'`-]/g, '');
  const banglaNeedle = head.replace(/[\s'`-]/g, '');
  const surahs = getSurahs();
  const normalised = (s: Surah) => ({
    english: s.englishName.toLowerCase().replace(/[\s'`-]/g, ''),
    bangla: (s.banglaName ?? '').replace(/[\s'`-]/g, ''),
  });

  // Prefer an exact match, then a prefix match, and only then a substring.
  // Otherwise a short name such as "ya" would resolve to the first surah that
  // happens to contain those letters.
  const exact = surahs.find((s) => {
    const n = normalised(s);
    return n.english === needle || (banglaNeedle !== '' && n.bangla === banglaNeedle);
  });
  if (exact) return exact;

  // English names carry an "al-"/"an-"/"as-" article, so also compare with it
  // stripped: "baqarah" should find "Al-Baqarah".
  const stripArticle = (name: string) => name.replace(/^(al|an|as|ash|at|az|ad|ar|adh)/, '');
  const articleFree = (s: Surah) => stripArticle(normalised(s).english);
  const prefix = surahs.find(
    (s) => normalised(s).english.startsWith(needle) || articleFree(s).startsWith(needle),
  );
  if (prefix && needle.length >= 3) return prefix;

  // Bangla names: compare folded skeletons, with the "আল-"/"আন-" article
  // removed, so "বাকারা" and "আল-বাক্বারাহ" both resolve.
  const banglaArticle = (name: string) => name.replace(/^(আল|আন|আস|আশ|আত|আজ|আদ|আর)/, '');
  const foldedNeedle = foldBangla(head);
  if (foldedNeedle.length >= 2) {
    const banglaExact = surahs.find((s) => {
      const folded = foldBangla(s.banglaName ?? '');
      return folded === foldedNeedle || banglaArticle(folded) === foldedNeedle;
    });
    if (banglaExact) return banglaExact;

    const banglaPrefix = surahs.find((s) => {
      const folded = foldBangla(s.banglaName ?? '');
      return folded.startsWith(foldedNeedle) || banglaArticle(folded).startsWith(foldedNeedle);
    });
    if (banglaPrefix) return banglaPrefix;
  }

  return null;
}
