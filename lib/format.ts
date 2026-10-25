// Number formatting for the reader UI.
// Bangla uses its own digits (১১৪), which is what the design uses for surah
// numbers, ayah counts and references.

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Replace ASCII digits with Bangla digits. Non-digits pass through. */
export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => BANGLA_DIGITS[Number(digit)]);
}

/**
 * Format a count for display in the given locale. Bangla gets Bangla digits,
 * every other locale keeps Latin digits (Arabic-Indic digits are not used by
 * this app's Arabic UI).
 */
export function formatCount(value: number, locale: string): string {
  const text = String(value);
  return locale === 'bn' ? toBanglaDigits(text) : text;
}

/** "৭ আয়াত" / "7 ayahs" without the plural rules living in components. */
export function formatAyahCount(value: number, locale: string): string {
  return formatCount(value, locale);
}
