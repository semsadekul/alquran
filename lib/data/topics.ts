// lib/data/topics.ts
// Curated high-volume Quranic topic hubs, essential surahs, and famous verses.

export interface TopicVerseReference {
  surahNumber: number;
  ayahNumber: number;
}

export interface TopicHub {
  slug: string;
  title: string;
  banglaTitle: string;
  arabicTitle: string;
  tagline: string;
  banglaTagline: string;
  description: string;
  hadithNote?: string;
  targetSurahNumber?: number;
  verses: TopicVerseReference[];
}

export const TOPIC_HUBS: TopicHub[] = [
  {
    slug: 'ayatul-kursi',
    title: 'Ayatul Kursi (The Throne Verse)',
    banglaTitle: 'আয়াতুল কুরসী (Ayatul Kursi)',
    arabicTitle: 'آيَةُ الْكُرْسِيِّ',
    tagline: 'The Greatest Verse in the Holy Quran',
    banglaTagline: 'পবিত্র কুরআনের সর্বশ্রেষ্ঠ আয়াত',
    description:
      'Ayatul Kursi (Surah Al-Baqarah 2:255) is regarded as the most powerful and majestic verse in the Quran, affirming the supreme oneness, sovereignty, and eternal living nature of Allah.',
    hadithNote:
      'The Prophet ﷺ said: "Whoever recites Ayatul Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death." (Sunan an-Nasa’i)',
    targetSurahNumber: 2,
    verses: [{ surahNumber: 2, ayahNumber: 255 }],
  },
  {
    slug: 'surah-yaseen',
    title: 'Surah Yaseen (The Heart of the Quran)',
    banglaTitle: 'সূরা ইয়াসীন (Surah Yaseen)',
    arabicTitle: 'سُورَةُ يس',
    tagline: 'The Vibrant Heart of the Holy Revelation',
    banglaTagline: 'কুরআনের হৃৎপিণ্ড',
    description:
      'Surah Yaseen (Chapter 36) emphasizes the divine message, the resurrection, signs of Allah in nature, and spiritual awakenings.',
    hadithNote:
      'The Prophet ﷺ said: "Everything has a heart, and the heart of the Quran is Yaseen." (Jami` at-Tirmidhi)',
    targetSurahNumber: 36,
    verses: Array.from({ length: 12 }, (_, i) => ({ surahNumber: 36, ayahNumber: i + 1 })),
  },
  {
    slug: 'surah-mulk',
    title: 'Surah Al-Mulk (The Sovereignty)',
    banglaTitle: 'সূরা আল-মুলক (Surah Al-Mulk)',
    arabicTitle: 'سُورَةُ الْمُلْكِ',
    tagline: 'Shield and Intercession from the Grave',
    banglaTagline: 'কবরের আজাব থেকে মুক্তির রক্ষাকবচ',
    description:
      'Surah Al-Mulk (Chapter 67) reflects upon the flawless dominion of Allah over the universe and the purpose of life and death as a test of deeds.',
    hadithNote:
      'The Prophet ﷺ said: "There is a Surah of thirty verses which will intercede for its companion until he is forgiven: Tabarakallazi biyadihil-mulk." (Abu Dawud)',
    targetSurahNumber: 67,
    verses: Array.from({ length: 10 }, (_, i) => ({ surahNumber: 67, ayahNumber: i + 1 })),
  },
  {
    slug: 'surah-kahf',
    title: 'Surah Al-Kahf (The Cave)',
    banglaTitle: 'সূরা আল-কাহাফ (Surah Al-Kahf)',
    arabicTitle: 'سُورَةُ الْكَهْفِ',
    tagline: 'Friday Illumination and Protection from Dajjal',
    banglaTagline: 'জুমুআর দিনের নূর ও ফিতনা থেকে নিরাপত্তা',
    description:
      'Surah Al-Kahf (Chapter 18) teaches four essential lessons against trials: trial of faith (Sleepers of Cave), trial of wealth, trial of knowledge (Musa & Khidr), and trial of power (Dhul-Qarnayn).',
    hadithNote:
      'The Prophet ﷺ said: "Whoever reads Surah Al-Kahf on Friday, Allah will illuminate for him a light between the two Fridays." (al-Hakim)',
    targetSurahNumber: 18,
    verses: [
      { surahNumber: 18, ayahNumber: 1 },
      { surahNumber: 18, ayahNumber: 2 },
      { surahNumber: 18, ayahNumber: 3 },
      { surahNumber: 18, ayahNumber: 4 },
      { surahNumber: 18, ayahNumber: 10 },
      { surahNumber: 18, ayahNumber: 110 },
    ],
  },
  {
    slug: 'surah-waqiah',
    title: 'Surah Al-Waqi\'ah (The Inevitable)',
    banglaTitle: 'সূরা আল-ওয়াকিয়াহ (Surah Al-Waqiah)',
    arabicTitle: 'سُورَةُ الْوَاقِعَةِ',
    tagline: 'Protection from Poverty and Remembrance of the Hereafter',
    banglaTagline: 'দারিদ্র্য মুক্তি ও আখিরাতের স্মরণ',
    description:
      'Surah Al-Waqi\'ah (Chapter 56) vividly categorizes humanity on the Day of Judgment into three groups: the foremost in faith, the companions of the right, and the companions of the left.',
    hadithNote:
      'The Prophet ﷺ advised reading Surah Al-Waqi\'ah at night for spiritual peace and protection from poverty.',
    targetSurahNumber: 56,
    verses: Array.from({ length: 10 }, (_, i) => ({ surahNumber: 56, ayahNumber: i + 1 })),
  },
  {
    slug: 'surah-ar-rahman',
    title: 'Surah Ar-Rahman (The Beneficent)',
    banglaTitle: 'সূরা আর-রহমান (Surah Ar-Rahman)',
    arabicTitle: 'سُورَةُ الرَّحْمَٰنِ',
    tagline: 'Which of the Favors of Your Lord Will You Deny?',
    banglaTagline: 'তোমাদের রবের কোন্ নেয়ামতকে তোমরা অস্বীকার করবে?',
    description:
      'Known as \'Uroos al-Quran (The Bride of the Quran), this chapter celebrates the boundless mercy, creations, celestial bodies, and paradise prepared for the righteous.',
    targetSurahNumber: 55,
    verses: Array.from({ length: 13 }, (_, i) => ({ surahNumber: 55, ayahNumber: i + 1 })),
  },
  {
    slug: 'last-two-ayahs-baqarah',
    title: 'Last 2 Ayahs of Surah Al-Baqarah (Amanar Rasool)',
    banglaTitle: 'সূরা বাকারার শেষ দুই আয়াত (Amanar Rasool)',
    arabicTitle: 'خَوَاتِيمُ سُورَةِ الْبَقَرَةِ',
    tagline: 'Sufficient Protection for the Night',
    banglaTagline: 'রাতের যথেষ্ট নিরাপত্তা ও রহমত',
    description:
      'Verses 285 and 286 of Surah Al-Baqarah carry supreme supplications for forgiveness, mercy, and victory over trials.',
    hadithNote:
      'The Prophet ﷺ said: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will be sufficient for him." (Sahih al-Bukhari)',
    targetSurahNumber: 2,
    verses: [
      { surahNumber: 2, ayahNumber: 285 },
      { surahNumber: 2, ayahNumber: 286 },
    ],
  },
  {
    slug: 'duas-for-parents',
    title: 'Quranic Duas for Parents',
    banglaTitle: 'পিতামাতার জন্য কুরআনের দোয়া',
    arabicTitle: 'دُعَاءُ الْوَالِدَيْنِ',
    tagline: 'Repaying Love and Mercy with Divine Prayers',
    banglaTagline: 'পিতা-মাতার জন্য রহমত ও মাগফিরাতের দোয়া',
    description:
      'The Holy Quran commands kindness to parents and provides the most tender, deeply emotional prayers for their mercy and forgiveness.',
    verses: [
      { surahNumber: 17, ayahNumber: 24 },
      { surahNumber: 14, ayahNumber: 41 },
      { surahNumber: 71, ayahNumber: 28 },
    ],
  },
  {
    slug: 'verses-on-patience-sabr',
    title: 'Verses on Patience and Perseverance (Sabr)',
    banglaTitle: 'ধৈর্য ও অবিচলতা (সবর) সম্পর্কিত আয়াত',
    arabicTitle: 'آيَاتُ الصَّبْرِ',
    tagline: 'Verily, Allah is with the Patient',
    banglaTagline: 'নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন',
    description:
      'Patience (Sabr) is praised over 90 times in the Quran as the hallmark of true faith and the gateway to divine help and endless reward.',
    verses: [
      { surahNumber: 2, ayahNumber: 153 },
      { surahNumber: 2, ayahNumber: 155 },
      { surahNumber: 2, ayahNumber: 156 },
      { surahNumber: 3, ayahNumber: 200 },
      { surahNumber: 39, ayahNumber: 10 },
    ],
  },
  {
    slug: 'verses-on-rizq-sustenance',
    title: 'Verses on Rizq and Divine Sustenance',
    banglaTitle: 'রিজিক ও বরকত সম্পর্কিত আয়াত',
    arabicTitle: 'آيَاتُ الرِّزْقِ',
    tagline: 'Allah Provides for Whom He Wills Without Limit',
    banglaTagline: 'আল্লাহ যাকে ইচ্ছা সীমাহীন রিজিক দান করেন',
    description:
      'Understand the divine keys to sustenance: Taqwa, gratitude (Shukr), Istighfar, and trust (Tawakkul) in Allah the Supreme Provider (Ar-Razzaq).',
    verses: [
      { surahNumber: 65, ayahNumber: 2 },
      { surahNumber: 65, ayahNumber: 3 },
      { surahNumber: 11, ayahNumber: 6 },
      { surahNumber: 14, ayahNumber: 7 },
      { surahNumber: 51, ayahNumber: 22 },
    ],
  },
  {
    slug: 'verses-on-forgiveness-tawbah',
    title: 'Verses on Mercy and Forgiveness (Tawbah)',
    banglaTitle: 'ক্ষমা ও তওবা সম্পর্কিত আয়াত',
    arabicTitle: 'آيَاتُ الْمَغْفِرَةِ وَالتَّوْبَةِ',
    tagline: 'Despair Not of the Mercy of Allah',
    banglaTagline: 'আল্লাহর রহমত থেকে নিরাশ হয়ো না',
    description:
      'No sin is greater than the mercy of the Most Compassionate. These verses bring immense solace to seeking hearts.',
    verses: [
      { surahNumber: 39, ayahNumber: 53 },
      { surahNumber: 3, ayahNumber: 135 },
      { surahNumber: 4, ayahNumber: 110 },
      { surahNumber: 25, ayahNumber: 70 },
    ],
  },
  {
    slug: 'duas-for-anxiety-hardship',
    title: 'Duas for Anxiety, Grief, and Hardship',
    banglaTitle: 'কষ্ট, দুশ্চিন্তা ও বিপদ মুক্তির দোয়া',
    arabicTitle: 'أَدْعِيَةُ الْفَرَجِ وَالْكَرْبِ',
    tagline: 'With Hardship Comes Ease',
    banglaTagline: 'কষ্টের সাথেই স্বস্তি রয়েছে',
    description:
      'Powerful Quranic supplications taught by prophets in moments of supreme distress, including the Dua of Prophet Yunus (AS) in the belly of the whale.',
    verses: [
      { surahNumber: 21, ayahNumber: 87 },
      { surahNumber: 9, ayahNumber: 129 },
      { surahNumber: 94, ayahNumber: 5 },
      { surahNumber: 94, ayahNumber: 6 },
    ],
  },
];

export function getTopicBySlug(slug: string): TopicHub | undefined {
  return TOPIC_HUBS.find((t) => t.slug === slug);
}

export function getAllTopics(): TopicHub[] {
  return TOPIC_HUBS;
}
