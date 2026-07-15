import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSurahByNumber, getVersesBySurah, getSurahs } from '@/lib/data/quran';

export function generateStaticParams() {
  const surahs = getSurahs();
  const params: { surah: string; ayah: string }[] = [];
  
  for (const surah of surahs) {
    for (let ayah = 1; ayah <= surah.numberOfAyahs; ayah++) {
      params.push({
        surah: surah.number.toString(),
        ayah: ayah.toString(),
      });
    }
  }
  
  return params;
}
export async function generateMetadata({ params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah, ayah } = await params;
  const s = parseInt(surah, 10);
  const a = parseInt(ayah, 10);
  const surahMeta = getSurahByNumber(s);
  if (!surahMeta) return { title: 'Not Found' };
  return {
    title: `Tafsir — ${surahMeta.englishName} ${s}:${a}`,
    description: `Tafsir and commentary for verse ${s}:${a} of Surah ${surahMeta.englishName}.`
  };
}

export default async function TafsirPage({ params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah, ayah } = await params;
  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);
  const surahMeta = getSurahByNumber(surahNum);
  if (!surahMeta) notFound();

  const verses = getVersesBySurah(surahNum);
  const verse = verses.find(v => v.ayah === ayahNum);
  if (!verse) notFound();

  const prevAyah = ayahNum > 1 ? ayahNum - 1 : null;
  const nextAyah = ayahNum < surahMeta.numberOfAyahs ? ayahNum + 1 : null;

  return (
    <div className="reader-page">
      <Link className="back-link" href={`/quran/surahs/${surahNum}`}>← {surahMeta.englishName}</Link>

      <div className="surah-header-card" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Tafsir</p>
        <h1 style={{ fontSize: '1.5rem' }}>{surahMeta.englishName} — {surahNum}:{ayahNum}</h1>
        <p className="lede">{surahMeta.englishNameTranslation}</p>
      </div>

      <article className="verse-card" style={{ marginBottom: 32 }}>
        <div className="verse-badge">{surahNum}:{ayahNum}</div>
        <div className="verse-arabic">{verse.arabic}</div>
        <div className="verse-translation">
          <span className="translation-label">Bangla</span>
          <p>{verse.bangla}</p>
        </div>
        <div className="verse-translation">
          <span className="translation-label">English</span>
          <p>{verse.english}</p>
        </div>
      </article>

      <div className="tafsir-section">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Tafsir & Commentary</h2>
        <div className="tafsir-placeholder">
          <p>
            Tafsir content for this verse will be loaded from the database once the tafsir data ingestion
            pipeline is complete. This will include classical and contemporary commentary in Bengali and English.
          </p>
          <p className="coming-soon-note">
            Supported tafsir sources: Ibn Kathir, Jalalayn, Ma&apos;ariful Quran, Tafsir Uthmani.
          </p>
        </div>
      </div>

      <div className="verse-related">
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Translations</h3>
        <Link className="card card-link" href={`/quran/compare/${surahNum}/${ayahNum}`} style={{ display: 'block', marginBottom: 8 }}>
          Compare translations side by side →
        </Link>
      </div>

      <nav className="reader-nav" style={{ marginTop: 32 }}>
        {prevAyah ? (
          <Link className="reader-nav-btn" href={`/quran/tafsir/${surahNum}/${prevAyah}`}>
            ← Ayah {prevAyah}
          </Link>
        ) : <span />}
        {nextAyah ? (
          <Link className="reader-nav-btn" href={`/quran/tafsir/${surahNum}/${nextAyah}`}>
            Ayah {nextAyah} →
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
