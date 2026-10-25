// lib/speech/arabic.ts
// Arabic normalization, phoneme/token matching, and Web Speech API utilities for real-time Hifz recitation.

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Strip diacritics / harakat / Quranic marks
    .replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '')
    // Strip tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alef variants (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Alif Maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Strip punctuation and special symbols
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،۝0-9]/g, '')
    .trim();
}

/**
 * Splits an Arabic verse into normalized word tokens.
 */
export function tokenizeArabicVerse(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeArabic)
    .filter(Boolean);
}

export interface MatchResult {
  matchedCount: number;
  isComplete: boolean;
  hasMismatch: boolean;
  mismatchWord?: string;
  matchedWords: boolean[];
}

/**
 * Matches a spoken transcript against the target verse's word list.
 * Evaluates sequentially to ensure the user recites in the correct order.
 */
export function matchSpokenTranscript(
  targetTokens: string[],
  spokenTranscript: string,
): MatchResult {
  if (targetTokens.length === 0) {
    return {
      matchedCount: 0,
      isComplete: false,
      hasMismatch: false,
      matchedWords: [],
    };
  }

  const spokenTokens = tokenizeArabicVerse(spokenTranscript);
  const matchedWords = new Array(targetTokens.length).fill(false);
  let targetIndex = 0;
  let hasMismatch = false;
  let mismatchWord: string | undefined;

  for (const spoken of spokenTokens) {
    if (targetIndex >= targetTokens.length) break;

    const target = targetTokens[targetIndex];

    // Direct match or partial prefix/suffix match (accounts for Arabic prefixes like و, ف, ب, ل)
    if (
      spoken === target ||
      spoken.endsWith(target) ||
      target.endsWith(spoken) ||
      spoken.startsWith(target)
    ) {
      matchedWords[targetIndex] = true;
      targetIndex += 1;
    } else {
      // Word didn't match the current expected target token
      hasMismatch = true;
      mismatchWord = spoken;
    }
  }

  return {
    matchedCount: targetIndex,
    isComplete: targetIndex === targetTokens.length,
    hasMismatch,
    mismatchWord,
    matchedWords,
  };
}

/**
 * Checks if the browser supports Web Speech API.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}
