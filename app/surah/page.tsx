import { redirect } from 'next/navigation';

/**
 * Redirects the /surah route to /quran/library (the canonical 114-surah list).
 * This provides a clean "Surah" entry in the nav that resolves to a real page.
 */
export default function SurahRedirect() {
  redirect('/quran/library');
}
