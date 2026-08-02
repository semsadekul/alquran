export interface Dua {
  arabic: string;
  transliteration: string;
  bangla: string;
  english: string;
  source: string;
  category: 'Morning' | 'Evening' | 'Sleep' | 'Eating' | 'Travel' | 'Forgiveness' | 'Distress' | 'General';
}

export const duas: Dua[] = [
  {
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: "Allāhumma bika aṣbaḥnā wa bika amsainā, wa bika naḥyā wa bika namūt, wa ilaykan-nushūr",
    bangla: "হে আল্লাহ! আপনারই সহায়তায় আমরা ভোর করি, আপনারই সহায়তায় আমরা সন্ধ্যা করি, আপনারই ইচ্ছায় আমরা বাচি এবং মরি, এবং আপনারই অভিমুখে পুনরুত্থান ঘটে।",
    english: "O Allah, by Your leave we have reached the morning and by Your leave we must reach the evening. By Your leave we live and die, and unto You is our resurrection.",
    source: "At-Tirmidhi 2894",
    category: 'Morning',
  },
  {
    arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    transliteration: "Allāhumma mā aṣbaḥa bī min niʿmatin aw bi-aḥadin min khalqika fa-minka waḥdaka lā sharīka lak, fa-laka l-ḥamdu wa laka sh-shukr",
    bangla: "হে আল্লাহ! যে সকল নিয়ামত ভোরে আমার বা কারো ওপর নেয়াম হলো, তা আপনিই একা (দিলেন)। আপনার কোনো সাথী নেই। সব প্রশংসা ও কৃতজ্ঞতা আপনার জন্য।",
    english: "O Allah, whatever blessing has been received by me or anyone of Your creation in the morning is from You alone, without any partner. All praise and thanks belong to You.",
    source: "Abu Dawud 505",
    category: 'Morning',
  },
  {
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration: "Allāhumma bika amsainā wa bika aṣbaḥnā, wa bika naḥyā wa bika namūt, wa ilaykal-maṣīr",
    bangla: "হে আল্লাহ! আপনারই সহায়তায় আমরা সন্ধ্যা করি এবং আপনারই সহায়তায় ভোর করি। আপনারই ইচ্ছায় আমরা বাচি ও মরি, এবং আপনারই অভিমুখে প্রত্যাবর্তন।",
    english: "O Allah, by Your leave we have reached the evening and by Your leave we reach the morning. By Your leave we live and die, and unto You is our return.",
    source: "At-Tirmidhi 2896",
    category: 'Evening',
  },
  {
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "Amsainā wa amsal-mulku lillāhi wal-ḥamdu lillāhi lā ilāha illallāhu waḥdahu lā sharīka lahu",
    bangla: "আমরা সন্ধ্যায় প্রবেশ করলাম এবং রাজত্বও তাঁরই। সব প্রশংসার মালিকও আল্লাহ। আল্লাহ ছাড়া কোনো মাশুখ নেই, একা তিনি, তার কোনো অংশীদার নেই।",
    english: "We have reached the evening and at this very time unto Allah belongs all sovereignty. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.",
    source: "Muslim 2681",
    category: 'Evening',
  },
  {
    arabic: 'بِسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: "Bismika Allāhumma amūt wa aḥyā",
    bangla: "হে আল্লাহ! আপনারই নামে আমি মৃত্যুবরণ করি এবং আপনারই নামে আমি বাঁচি।",
    english: "In Your name, O Allah, I die and I live.",
    source: "Ahmad 22709",
    category: 'Sleep',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ',
    transliteration: "Allāhumma innī aslamtu nafasī ilayka wa wajahtu wajhī ilayka wa aljahtu ẓaharī ilayka",
    bangla: "হে আল্লাহ! আমি আমার সম্পূর্ণ আত্মাকে আপনারই কাছে সমর্পণ করলাম, আমার সম্মুখ আপনারই দিকে ফেরত রাখলাম, এবং আপনারই সহায়তায় নির্ভর করলাম।",
    english: "O Allah, I submit myself to You, I face my countenance towards You, and I entrust my affairs to You.",
    source: "Bukhari 6314",
    category: 'Sleep',
  },
  {
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: "Bismillāh",
    bangla: "আল্লাহর নামে (শুরু করছি)।",
    english: "In the name of Allah.",
    source: "Abu Dawud 3767",
    category: 'Eating',
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: "Al-ḥamdu lillāhil-ladhī aṭʿamanī hādha wa razaqanihi min ghayri ḥawlin minnī wa lā quwwatin",
    bangla: "সব প্রশংসা আল্লাহর যিনি আমাকে এটি খেতে দিলেন এবং এ আমার কোনো শক্তি বা সামর্থ্য ছাড়াই রিযিক করলেন।",
    english: "All praise is for Allah who fed me this and provided it without any effort or power on my part.",
    source: "Abu Dawud 3768",
    category: 'Eating',
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: "Subḥānallāh",
    bangla: "আল্লাহ পবিত্র।",
    english: "Glory be to Allah.",
    source: "Sahih",
    category: 'General',
  },
  {
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: "Lā ilāha illallāh",
    bangla: "আল্লাহ ছাড়া কোনো ইলাহ নেই।",
    english: "There is no god but Allah.",
    source: "Sahih",
    category: 'General',
  },
  {
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: "Astaghfirullāh",
    bangla: "আমি আল্লাহর কাছে মাফ চাই।",
    english: "I seek forgiveness from Allah.",
    source: "Sahih",
    category: 'Forgiveness',
  },
  {
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: "Allāhumma innaka ʿafuwwun tuḥibbul-ʿafwa faʿfu ʿannī",
    bangla: "হে আল্লাহ! আপনি ক্ষমাশীল, ক্ষমাকে পছন্দ করেন। অতএব আমাকে ক্ষমা করুন।",
    english: "O Allah, You are Forgiving and love forgiveness, so forgive me.",
    source: "Ibn Majah 3850",
    category: 'Forgiveness',
  },
  {
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: "Lā ilāha illā anta subḥānaka innī kuntu minnaẓ-ẓālimīn",
    bangla: "আপনি ছাড়া কোনো ইলাহ নেই। আপনি পবিত্র। আমি অবশ্যই জুলমকারীদের অন্তর্ভুক্ত ছিলাম।",
    english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    source: "Qur'an 21:87 · Sunan al-Tirmidhi 3505",
    category: 'Distress',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: "Allāhumma innī aʿūdhu bika minal-hammī wal-ḥazanī wal-ʿajzi wal-kasali wal-bukhli wal-jubni wa ḍalaʿid-dayni wa ghalabatir-rijāl",
    bangla: "হে আল্লাহ! আমি চিন্তা ও দুঃখ, অক্ষমতা ও আলসে, লোভিতা ও ভীতুতা, ঋণের বোঝা ও মানুষের আধিপত্য থেকে আপনার আশ্রয় চাই।",
    english: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
    source: "Bukhari 6369",
    category: 'Distress',
  },
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbanā ātinā fid-dunyā ḥasanah wa fil-ākhirati ḥasanah wa qinā ʿadhāban-nār",
    bangla: "হে আমাদের প্রভু! আমাদের এই জগতে মঙ্গল দিন এবং পরকালেও মঙ্গল দিন এবং জাহান্নামের শাস্তি থেকে রক্ষা করুন।",
    english: "Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.",
    source: "Qur'an 2:201",
    category: 'General',
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: "Subḥānallāhi wa biḥamdih, Subḥānallāhil-ʿAẓīm",
    bangla: "আমি আল্লাহর পবিত্রতা ও তাঁর প্রশংসা করছি। আমি আল্লাহ অমাবতের পবিত্রতা করছি।",
    english: "Glory be to Allah and His praise, Glory be to Allah the Great.",
    source: "Bukhari 3355 · Muslim 2692",
    category: 'General',
  },
  {
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    transliteration: "Rabbish-raḥ lī ṣadri wa yassir lī amrī",
    bangla: "হে আমার প্রভু! আমার বুকের মধ্যে প্রশান্তি দিন এবং আমার কাজ সহজ করে দিন।",
    english: "My Lord, expand my chest [with confidence] and ease my task for me.",
    source: "Qur'an 20:25-26",
    category: 'Distress',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: "Rabbi zidnī ʿilman",
    bangla: "হে আমার প্রভু! আমার জ্ঞানে আরো বৃদ্ধি করুন।",
    english: "My Lord, increase me in knowledge.",
    source: "Qur'an 20:114",
    category: 'General',
  },
];

export const categories: Dua['category'][] = [
  'Morning', 'Evening', 'Sleep', 'Eating', 'Travel',
  'Forgiveness', 'Distress', 'General',
];
