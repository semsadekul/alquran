import { redirect } from 'next/navigation';

// The practice session now lives directly on the Hifz page.
export default function HifzPracticeRedirect() {
  redirect('/quran/hifz');
}
