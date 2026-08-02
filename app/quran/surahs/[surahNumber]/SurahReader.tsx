'use client';

import { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ReaderSettings,
  loadReaderSettings,
  DEFAULT_READER_SETTINGS,
} from '@/components/ui/ReaderSettings';
import { VerseNumberBadge } from '@/components/ui/VerseNumberBadge';
import { Equalizer } from '@/components/ui/Equalizer';
import { usePlayer } from '@/components/quran/player-context';
import { getSurah } from '@/lib/data/quran';
import { recordRecentSurah } from '@/lib/storage';
import {
  PlayIcon,
  DownloadIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@/components/ui/Icon';

interface ReaderSettingsType {
  arabicSize: number;
  arabicLineHeight: number;
  translationSize: number;
  showTransliteration: boolean;
  showBanglaPronunciation: boolean;
}

interface Verse {
  number: number;
  arabic: string;
  transliteration?: string;
  banglaTransliteration?: string;
  bangla: string;
  english: string;
}

interface SurahVersesPayload {
  surah: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Verse[];
}

// Curated fallback so the reader still renders before the full corpus is
// generated (run `node scripts/fetch-quran.mjs` for all 114 surahs).
const FALLBACK_VERSES: Record<number, Verse[]> = {
  1: [
    { number: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Bismillāhir-raḥmānir-raḥīm', banglaTransliteration: 'বিসমিল্লাহির রহমানির রাহিম', bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে', english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
    { number: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Al-ḥamdu lillāhi rabbi l-ʿālamīn', banglaTransliteration: 'আলহামদুলিল্লাহি রাব্বিল আলামীন', bangla: 'সকল প্রশংসা আল্লাহ তাআলার যিনি জগতবাসীর প্রতিপালক', english: 'All praise is due to Allah, Lord of the worlds.' },
    { number: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Ar-raḥmāni r-raḥīm', banglaTransliteration: 'আর-রাহমানির আরাহীম', bangla: 'পরম করুণাময়, অসীম দয়ালু', english: 'The Entirely Merciful, the Especially Merciful.' },
    { number: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', transliteration: 'Māliki yawmi d-dīn', banglaTransliteration: 'মালিকি ইয়ুমিদ-দীন', bangla: 'বিচার দিবসের মালিক', english: 'Sovereign of the Day of Recompense.' },
    { number: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', transliteration: 'Iyyāka naʿbudu wa-iyyāka nastʿīn', banglaTransliteration: 'ইয়াাকা নাআবুদু ওয়া ইয়াাকা নাস্তাঈন', bangla: 'আমরা একমাত্র আপনার ইবাদত করি এবং একমাত্র আপনার কাছ সাহায্য প্রার্থনা করি', english: 'It is You we worship and You we ask for help.' },
    { number: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', transliteration: 'Ihdināṣ-ṣirāṭal-mustaqīm', banglaTransliteration: 'ইহদিনাশ শিরাতাল মুস্তাকিম', bangla: 'আমাদেরকে সরল পথ প্রদর্শন করুন', english: 'Guide us to the straight path.' },
    { number: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', transliteration: 'Ṣirāṭal-ladhīna anʿamta ʿalayhim ghayril-maghḍūbi ʿalayhim wa lāḍ-ḍāllīn', banglaTransliteration: 'শিরাতাল লাজীনা আনআমতা ʿআলাইহিম গাইরিল মাগদূবি ʿআলাইহিম ওয়া লা দদ-দাল্লীন', bangla: 'তাদের পথ যাদেরকে আপনি নেয়ামত দান করেছোন, তাদের পথ নয় যাদের উপর গজব নাযিল হয়েছো', english: 'The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray.' },
  ],
  112: [
    { number: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', transliteration: 'Qul huwa Allāhu aḥad', banglaTransliteration: 'কুল হুওয়াল্লাহু আহাদ', bangla: 'বলুন, তিনি আল্লাহ, এক', english: 'Say, He is Allah, [who is] One.' },
    { number: 2, arabic: 'اللَّهُ الصَّمَدُ', transliteration: 'Allāhuṣ-ṣamad', banglaTransliteration: 'আল্লাহুস-সামাদ', bangla: 'আল্লাহ অমুখাপেক্ষী', english: 'Allah, the Eternal Refuge.' },
    { number: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', transliteration: 'Lam yalid wa lam yūlad', banglaTransliteration: 'লাম যালিদ ওয়া লাম যুলাদ', bangla: 'তিনি কাউকে জন্ম দেননি এবং তাকে জন্ম দেয়া হয়নি', english: 'He neither begets nor is born.' },
    { number: 4, arabic: 'وَلَمْ يَكُن لَهُ كُفُوًا أَحَدٌ', transliteration: 'Wa lam yakul lahū kufuwan aḥad', banglaTransliteration: 'ওয়া লাম যাকুন লাহু কুফুওয়ান আহাদ', bangla: 'কেউ তার সমকক্ষ নয়', english: 'Nor is there to Him any equivalent.' },
  ],
  113: [
    { number: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', transliteration: 'Qul ʿūdhu birabbi l-falaq', banglaTransliteration: 'কুল আউযু বিরাব্বিল ফালাক্ব', bangla: 'বলুন, আমি আশ্রয় চাই প্রভাতের প্রতিপালকের কাছ থেকে', english: 'Say, I seek refuge in the Lord of daybreak.' },
    { number: 2, arabic: 'مِنْ شَرِّ مَا خَلَقَ', transliteration: 'Min sharri mā khalaq', banglaTransliteration: 'মিন শার্রি মা খালাক্ব', bangla: 'তিনি যা কিছু সৃষ্টি করেছেন এর মন্দ থেকে', english: 'From the evil of that which He created.' },
    { number: 3, arabic: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ', transliteration: 'Wa min sharri gāsiqin iżā waqab', banglaTransliteration: 'ওয়া মিন শার্রি গাসিকিন ইযা ওয়াকাব', bangla: 'এবং যখন ডুবে যায় রাতের অন্ধকারের মন্দ থেকে', english: 'And from the evil of darkness when it settles.' },
    { number: 4, arabic: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', transliteration: 'Wa min sharrin-naffāthāti fī l-ʿuqad', banglaTransliteration: 'ওয়া মিন শার্রিন নাফ্ফাসাতি ফিল ʿউকাদ', bangla: 'এবং গিঁটে ফুঁ দেওয়া নারীদের মন্দ থেকে', english: 'And from the evil of the blowers in knots.' },
    { number: 5, arabic: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ', transliteration: 'Wa min sharri ḥāsidin iżā ḥasad', banglaTransliteration: 'ওয়া মিন শার্রি হাসিদিন ইযা হাসাদ', bangla: 'এবং হিংসুককের মন্দ থেকে যখন সে হিংসা করে', english: 'And from the evil of an envier when he envies.' },
  ],
  114: [
    { number: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration: 'Qul ʿūdhū birabbin-nās', banglaTransliteration: 'কুল আউযু বিরাব্বিন নাস', bangla: 'বলুন, আমি আশ্রয় চাই মানুষের প্রতিপালকের কাছ থেকে', english: 'Say, I seek refuge in the Lord of mankind.' },
    { number: 2, arabic: 'مَلِكِ النَّاسِ', transliteration: 'Malikin-nās', banglaTransliteration: 'মালিকিন নাস', bangla: 'মানুষের রাজা', english: 'The Sovereign of mankind.' },
    { number: 3, arabic: 'إِلَٰهِ النَّاسِ', transliteration: 'Ilāhin-nās', banglaTransliteration: 'ইলাহিন নাস', bangla: 'মানুষের উপাস্য', english: 'The God of mankind.' },
    { number: 4, arabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', transliteration: 'Min sharril-waswāsil-khannās', banglaTransliteration: 'মিন শার্রিল ওয়াসওয়াসিল খাননাস', bangla: 'পিছিয়ে যাওয়া ফিসফিসকারীর মন্দ থেকে', english: 'From the evil of the retreating whisperer.' },
    { number: 5, arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', transliteration: 'Allazī yuwaswisu fī ṣudūrin-nās', banglaTransliteration: 'আলযী যুওয়াসউসু ফি ছুদূরিন নাস', bangla: 'যিনি মানুষের হৃদয়ে ফিসফিস করে', english: 'Who whispers in the breasts of mankind.' },
    { number: 6, arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', transliteration: 'Minal-jinnati wan-nās', banglaTransliteration: 'মিনাল জিন্নাতি ওয়া ননাস', bangla: 'জিন ও মানুষেরই মধ্য থেকে', english: 'From among jinn and mankind.' },
  ],
};

export default function SurahReader({
  surahNumber,
  initialVerses,
}: {
  surahNumber: string;
  initialVerses?: Verse[] | null;
}) {
  const intl = useIntl();
  const [settings, setSettings] = useState<ReaderSettingsType>({
    ...DEFAULT_READER_SETTINGS,
  });
  // Verse content is server-rendered when the corpus exists — the fallback
  // fetch below only runs when initialVerses is empty (corpus not generated).
  const [verses, setVerses] = useState<Verse[]>(initialVerses ?? []);
  const [loading, setLoading] = useState(!initialVerses?.length);
  const [usingFallback, setUsingFallback] = useState(false);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Global playback state — highlight + auto-scroll follow the active verse
  // while the player is reciting THIS surah.
  const {
    currentIndex,
    isPlaying,
    surahNumber: activeSurahNumber,
    playFromIndex,
    pauseAtIndex,
  } = usePlayer();

  const number = parseInt(surahNumber, 10);
  const surah = getSurah(number);

  // Auto-scroll the highlighted verse into view while playing (only when the
  // player is reciting this surah).
  useEffect(() => {
    if (!isPlaying || activeSurahNumber !== number) return;
    const el = verseRefs.current[currentIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isPlaying, activeSurahNumber, number]);

  // Clicking a verse badge starts playback from that verse (globally).
  const handleVerseClick = (verseNumber: number) => {
    const index = verses.findIndex((v) => v.number === verseNumber);
    if (index === -1) return;
    playFromIndex(number, verses, index, surah?.englishName);
  };

  // Per-verse play/pause toggle — plays the ayah (and continues through the
  // surah verse by verse) or pauses when the ayah is already playing.
  const handleVersePlayClick = (index: number) => {
    if (activeSurahNumber === number && currentIndex === index && isPlaying) {
      pauseAtIndex(index);
    } else {
      playFromIndex(number, verses, index, surah?.englishName);
    }
  };

  useEffect(() => {
    setSettings(loadReaderSettings());
    // Content is server-rendered when the corpus exists — record the visit.
    if (surah) {
      recordRecentSurah({
        surah: {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          banglaName: surah.banglaName,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType,
        },
        lastRead: Date.now(),
      });
    }
  }, [surah]);

  // Fallback: fetch the corpus when it wasn't included in the server payload.
  useEffect(() => {
    if (initialVerses && initialVerses.length > 0) return;
    let cancelled = false;
    setLoading(true);
    setUsingFallback(false);

    (async () => {
      try {
        const res = await fetch(`/data/verses/${surahNumber}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload: SurahVersesPayload = await res.json();
        if (cancelled) return;
        setVerses(payload.ayahs);
      } catch {
        if (cancelled) return;
        setVerses(FALLBACK_VERSES[number] ?? []);
        setUsingFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [surahNumber, number, initialVerses]);

  if (!surah) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">📖</div>
          <h1 className="font-display text-2xl font-semibold text-text">
            Surah not found
          </h1>
          <Link href="/quran/library">
            <Button variant="outline">Browse Surahs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Surah Header */}
      <Card variant="hero" className="p-8 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-50" />

        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-dark mb-2">
            সূরা
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="text-4xl md:text-5xl font-arabic text-text mb-2"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {surah.name}
          </p>

          <h1 className="font-display text-2xl md:text-3xl font-semibold text-text mb-1">
            {surah.englishName}
          </h1>
          <p className="text-text-muted mb-3">
            {surah.englishNameTranslation} ·{' '}
            <span className="bangla-ui">{surah.banglaName}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge tone="classic" size="sm">
              {surah.revelationType}
            </Badge>
            <Badge tone="classic" size="sm">
              {surah.numberOfAyahs} Ayahs
            </Badge>
          </div>

          {verses.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleVerseClick(1)}
                aria-label={intl.formatMessage({ id: 'audioPlayer.playSurah' })}
              >
                <PlayIcon className="w-4 h-4" />
                {intl.formatMessage({ id: 'audioPlayer.playSurah' })}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Bismillah */}
      {number !== 9 && (
        <div className="text-center py-6">
          <p
            dir="rtl"
            lang="ar"
            className="text-2xl md:text-3xl"
            style={{ fontFamily: 'var(--font-arabic)', color: 'var(--gold-dark)' }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Reader toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-text/70">
          {loading
            ? `Loading ${surah.englishName}…`
            : verses.length > 0
              ? `${verses.length} verses · ${surah.englishName}`
              : 'Verse content coming soon'}
          {!loading && usingFallback && (
            <p className="text-xs text-warning mt-1">
              Offline sample — run{' '}
              <code className="text-gold-dark">node scripts/fetch-quran.mjs</code> for
              the full corpus.
            </p>
          )}
        </div>
        <ReaderSettings onChange={setSettings} />
      </div>

      {/* Surah Content */}
      {loading ? (
        <Card variant="elevated" className="p-12">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        </Card>
      ) : verses.length > 0 ? (
        <Card variant="elevated" className="overflow-hidden">
          {verses.map((verse, index) => {
            // Strong gold ring while actively playing; subtle tint when the
            // verse is selected but paused (e.g. after finishing).
            const isCurrentVerse =
              activeSurahNumber === number && currentIndex === index;
            const isActive = isCurrentVerse && isPlaying;
            const isHighlighted = isCurrentVerse;
            return (
            <div
              key={verse.number}
              ref={(el) => {
                verseRefs.current[index] = el;
              }}
              className={`px-6 py-8 scroll-mt-24 transition-colors duration-300 ${
                verse.number % 2 === 1 ? 'bg-surface-highlight/50 dark:bg-surface-highlight/30' : ''
              } ${
                isActive
                  ? 'bg-gold/15 dark:bg-gold/10 ring-1 ring-inset ring-gold/40'
                  : isHighlighted
                    ? 'bg-gold/8 dark:bg-gold/5'
                    : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <VerseNumberBadge
                  number={verse.number}
                  active={isHighlighted}
                  onClick={() => handleVerseClick(verse.number)}
                />
                <div className="flex-1 min-w-0">
                  {/* Arabic */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="arabic-text text-text mb-3"
                    style={{
                      fontSize: `${settings.arabicSize}px`,
                      lineHeight: settings.arabicLineHeight,
                    }}
                  >
                    {verse.arabic}
                  </p>

                  {/* English Transliteration */}
                  {settings.showTransliteration && verse.transliteration && (
                    <p
                      className="verse-transliteration text-gold-dark/80 mb-1.5 italic"
                      style={{ fontSize: `${Math.max(settings.translationSize - 2, 13)}px` }}
                    >
                      {verse.transliteration}
                    </p>
                  )}

                  {/* Bangla Pronunciation */}
                  {settings.showBanglaPronunciation && verse.banglaTransliteration && (
                    <p
                      className="verse-bangla-transliteration text-gold-dark/70 mb-1.5 bangla-ui"
                      style={{ fontSize: `${Math.max(settings.translationSize - 2, 13)}px` }}
                    >
                      {verse.banglaTransliteration}
                    </p>
                  )}

                  {/* Bangla translation */}
                  <p
                    className="verse-bangla text-text/90 mb-1.5"
                    style={{ fontSize: `${settings.translationSize}px` }}
                  >
                    {verse.bangla}
                  </p>

                  {/* English translation */}
                  <p
                    className="text-text/60 italic"
                    style={{
                      fontSize: `${Math.max(settings.translationSize - 1, 12)}px`,
                    }}
                  >
                    &quot;{verse.english}&quot;
                  </p>

                  {/* Tafsirs / Lessons / Reflections tabs */}
                  <div className="mt-4 border-t border-border pt-3">
                    <div className="flex items-center gap-1 text-xs">
                      <button className="px-3 py-1.5 rounded-md text-gold-dark font-medium bg-gold/10">
                        {intl.formatMessage({ id: 'surah.tafsirs' })}
                      </button>
                      <button className="px-3 py-1.5 rounded-md text-text/40 hover:text-text/60 transition-colors">
                        {intl.formatMessage({ id: 'surah.lessons' })}
                      </button>
                      <button className="px-3 py-1.5 rounded-md text-text/40 hover:text-text/60 transition-colors">
                        {intl.formatMessage({ id: 'surah.reflections' })}
                      </button>
                    </div>
                    <p className="text-xs text-text/30 mt-2">
                      {intl.formatMessage({ id: 'surah.tafsirsCommingSoon' })}
                    </p>
                  </div>
                </div>

                {/* Per-verse play / pause — starts recitation from this ayah */}
                <button
                  type="button"
                  onClick={() => handleVersePlayClick(index)}
                  aria-label={intl.formatMessage(
                    { id: isActive ? 'audioPlayer.pauseVerse' : 'audioPlayer.playVerse' },
                    { number: verse.number }
                  )}
                  title={intl.formatMessage(
                    { id: isActive ? 'audioPlayer.pauseVerse' : 'audioPlayer.playVerse' },
                    { number: verse.number }
                  )}
                  className={`shrink-0 mt-1.5 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    isActive
                      ? 'bg-gold/15 border-gold/40 text-gold-dark animate-pulse-gold'
                      : 'bg-surface-2 border-border-subtle text-ink-3 hover:text-gold-dark hover:border-gold/40 hover:bg-gold/10 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isActive ? (
                    <Equalizer />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            );
          })}
        </Card>
      ) : (
        <Card variant="elevated" className="p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-bold text-text mb-2">
              Read Surah {surah.englishName}
            </h2>
            <p className="text-text/70 mb-6">
              Full verse content for this surah is being added.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="primary">
                <PlayIcon className="w-4 h-4" /> Play Audio
              </Button>
              <Button variant="outline">
                <DownloadIcon className="w-4 h-4" /> Download
              </Button>
              <Button variant="ghost">
                <BookmarkIcon className="w-4 h-4" /> Bookmark
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {number > 1 && (
          <Link href={`/quran/surahs/${number - 1}`}>
            <Button variant="outline">
              <ArrowLeftIcon className="w-4 h-4" /> Previous Surah
            </Button>
          </Link>
        )}
        {number < 114 && (
          <Link href={`/quran/surahs/${number + 1}`}>
            <Button variant="outline">
              Next Surah <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
