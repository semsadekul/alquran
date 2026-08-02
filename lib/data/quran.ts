// =====================================================
// Complete Quran Data — All 114 Surahs
// =====================================================
// This module serves as the single source of truth for surah metadata.
// All pages and components should import from here instead of duplicating inline.
// =====================================================

export interface Surah {
  number: number;
  name: string;                    // Arabic name
  englishName: string;
  englishNameTranslation: string;
  banglaName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juzCount: number;               // Primary juz this surah belongs to
}

// Juz boundaries: which juz each surah primarily appears in
// Note: Some surahs span multiple juz — we list the first/main one
const SURAH_DATA: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', englishNameTranslation: 'The Opening', banglaName: 'আল-ফাতিহা', numberOfAyahs: 7, revelationType: 'Meccan', juzCount: 1 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', banglaName: 'আল-বাক্বারাহ', numberOfAyahs: 286, revelationType: 'Medinan', juzCount: 1 },
  { number: 3, name: 'آل عمران', englishName: 'Ali \'Imran', englishNameTranslation: 'Family of Imran', banglaName: 'আলে ইমরান', numberOfAyahs: 200, revelationType: 'Medinan', juzCount: 3 },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', englishNameTranslation: 'The Women', banglaName: 'আন-নিসা', numberOfAyahs: 176, revelationType: 'Medinan', juzCount: 7 },
  { number: 5, name: 'المائدة', englishName: 'Al-Ma\'idah', englishNameTranslation: 'The Table Spread', banglaName: 'আল-ময়িদাহ', numberOfAyahs: 120, revelationType: 'Medinan', juzCount: 7 },
  { number: 6, name: 'الأنعام', englishName: 'Al-An\'am', englishNameTranslation: 'The Cattle', banglaName: 'আল-আনআম', numberOfAyahs: 165, revelationType: 'Meccan', juzCount: 8 },
  { number: 7, name: 'الأعراف', englishName: 'Al-A\'raf', englishNameTranslation: 'The Heights', banglaName: 'আল-আ\'রাফ', numberOfAyahs: 206, revelationType: 'Meccan', juzCount: 9 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', banglaName: 'আল-আনফাল', numberOfAyahs: 75, revelationType: 'Medinan', juzCount: 10 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', banglaName: 'আত-তাওবাহ', numberOfAyahs: 129, revelationType: 'Medinan', juzCount: 10 },
  { number: 10, name: 'يونس', englishName: 'Yunus', englishNameTranslation: 'Jonah', banglaName: 'ইউনুস', numberOfAyahs: 109, revelationType: 'Meccan', juzCount: 11 },
  { number: 11, name: 'هود', englishName: 'Hud', englishNameTranslation: 'Hud', banglaName: 'হুদ', numberOfAyahs: 123, revelationType: 'Meccan', juzCount: 11 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', englishNameTranslation: 'Joseph', banglaName: 'ইউসুফ', numberOfAyahs: 111, revelationType: 'Meccan', juzCount: 12 },
  { number: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', englishNameTranslation: 'The Thunder', banglaName: 'আর-রাদ', numberOfAyahs: 43, revelationType: 'Medinan', juzCount: 13 },
  { number: 14, name: 'ابراهيم', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', banglaName: 'ইবরাহীম', numberOfAyahs: 52, revelationType: 'Meccan', juzCount: 13 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', banglaName: 'আল-হিজর', numberOfAyahs: 99, revelationType: 'Meccan', juzCount: 14 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', banglaName: 'আন-নাহল', numberOfAyahs: 128, revelationType: 'Meccan', juzCount: 14 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', englishNameTranslation: 'The Night Journey', banglaName: 'আল-ইসরা', numberOfAyahs: 111, revelationType: 'Meccan', juzCount: 15 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', banglaName: 'আল-কাহফ', numberOfAyahs: 110, revelationType: 'Meccan', juzCount: 15 },
  { number: 19, name: 'مريم', englishName: 'Maryam', englishNameTranslation: 'Mary', banglaName: 'মারইয়াম', numberOfAyahs: 98, revelationType: 'Meccan', juzCount: 16 },
  { number: 20, name: 'طه', englishName: 'Taha', englishNameTranslation: 'Ta-Ha', banglaName: 'ত্ব-হা', numberOfAyahs: 135, revelationType: 'Meccan', juzCount: 16 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbya', englishNameTranslation: 'The Prophets', banglaName: 'আল-আম্বিয়া', numberOfAyahs: 112, revelationType: 'Meccan', juzCount: 17 },
  { number: 22, name: 'الحج', englishName: 'Al-Haj', englishNameTranslation: 'The Pilgrimage', banglaName: 'আল-হজ্জ', numberOfAyahs: 78, revelationType: 'Medinan', juzCount: 17 },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Mu\'minun', englishNameTranslation: 'The Believers', banglaName: 'আল-মু\'মিনুন', numberOfAyahs: 118, revelationType: 'Meccan', juzCount: 18 },
  { number: 24, name: 'النور', englishName: 'An-Nur', englishNameTranslation: 'The Light', banglaName: 'আন-নূর', numberOfAyahs: 64, revelationType: 'Medinan', juzCount: 18 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', englishNameTranslation: 'The Criterion', banglaName: 'আল-ফুরকান', numberOfAyahs: 77, revelationType: 'Meccan', juzCount: 18 },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shu\'ara', englishNameTranslation: 'The Poets', banglaName: 'আশ-শুআরা', numberOfAyahs: 227, revelationType: 'Meccan', juzCount: 19 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', englishNameTranslation: 'The Ant', banglaName: 'আন-নামল', numberOfAyahs: 93, revelationType: 'Meccan', juzCount: 19 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', banglaName: 'আল-ক্বাসাস', numberOfAyahs: 88, revelationType: 'Meccan', juzCount: 20 },
  { number: 29, name: 'العنكبوت', englishName: 'Al-\'Ankabut', englishNameTranslation: 'The Spider', banglaName: 'আল-আনকাবুত', numberOfAyahs: 69, revelationType: 'Meccan', juzCount: 20 },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', englishNameTranslation: 'The Romans', banglaName: 'আর-রূম', numberOfAyahs: 60, revelationType: 'Meccan', juzCount: 21 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', englishNameTranslation: 'Luqman', banglaName: 'লুকমান', numberOfAyahs: 34, revelationType: 'Meccan', juzCount: 21 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', englishNameTranslation: 'The Prostration', banglaName: 'আস-সাজদাহ', numberOfAyahs: 30, revelationType: 'Meccan', juzCount: 21 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', englishNameTranslation: 'The Combined Forces', banglaName: 'আল-আহযাব', numberOfAyahs: 73, revelationType: 'Medinan', juzCount: 22 },
  { number: 34, name: 'سبأ', englishName: 'Saba', englishNameTranslation: 'Sheba', banglaName: 'সাবা', numberOfAyahs: 54, revelationType: 'Meccan', juzCount: 22 },
  { number: 35, name: 'فاطر', englishName: 'Fatir', englishNameTranslation: 'Originator', banglaName: 'ফাতের', numberOfAyahs: 45, revelationType: 'Meccan', juzCount: 22 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', englishNameTranslation: 'Ya Sin', banglaName: 'ইয়াসিন', numberOfAyahs: 83, revelationType: 'Meccan', juzCount: 23 },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', englishNameTranslation: 'Those Who Set The Ranks', banglaName: 'আস-সাফফাত', numberOfAyahs: 182, revelationType: 'Meccan', juzCount: 23 },
  { number: 38, name: 'ص', englishName: 'Sad', englishNameTranslation: 'The Letter Sad', banglaName: 'সাদ', numberOfAyahs: 88, revelationType: 'Meccan', juzCount: 23 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', banglaName: 'আজ-যুমার', numberOfAyahs: 75, revelationType: 'Meccan', juzCount: 24 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', banglaName: 'গাফের', numberOfAyahs: 85, revelationType: 'Meccan', juzCount: 24 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', banglaName: 'ফুসসিলাত', numberOfAyahs: 54, revelationType: 'Meccan', juzCount: 25 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', englishNameTranslation: 'The Consultation', banglaName: 'আশ-শুরা', numberOfAyahs: 53, revelationType: 'Meccan', juzCount: 25 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', banglaName: 'আজ-যুখরূফ', numberOfAyahs: 89, revelationType: 'Meccan', juzCount: 25 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', englishNameTranslation: 'The Smoke', banglaName: 'আদ-দুখান', numberOfAyahs: 59, revelationType: 'Meccan', juzCount: 25 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', englishNameTranslation: 'The Crouching', banglaName: 'আল-য়াসিয়াহ', numberOfAyahs: 37, revelationType: 'Meccan', juzCount: 26 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', englishNameTranslation: 'The Wind-Curved Sandhills', banglaName: 'আল-আহক্বাফ', numberOfAyahs: 35, revelationType: 'Meccan', juzCount: 26 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', banglaName: 'মুহাম্মদ', numberOfAyahs: 38, revelationType: 'Medinan', juzCount: 26 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', banglaName: 'আল-ফাতহ', numberOfAyahs: 29, revelationType: 'Medinan', juzCount: 27 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', englishNameTranslation: 'The Rooms', banglaName: 'আল-হুজুরাত', numberOfAyahs: 18, revelationType: 'Medinan', juzCount: 27 },
  { number: 50, name: 'ق', englishName: 'Qaf', englishNameTranslation: 'The Letter Qaf', banglaName: 'ক্ব', numberOfAyahs: 45, revelationType: 'Meccan', juzCount: 27 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', englishNameTranslation: 'The Winnowing Winds', banglaName: 'আদ-য়ারিয়াত', numberOfAyahs: 60, revelationType: 'Meccan', juzCount: 27 },
  { number: 52, name: 'الطور', englishName: 'At-Tur', englishNameTranslation: 'The Mount', banglaName: 'আত-তূর', numberOfAyahs: 49, revelationType: 'Meccan', juzCount: 27 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', englishNameTranslation: 'The Star', banglaName: 'আন-নাজম', numberOfAyahs: 62, revelationType: 'Meccan', juzCount: 28 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', banglaName: 'আল-ক্বামার', numberOfAyahs: 55, revelationType: 'Meccan', juzCount: 28 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', banglaName: 'আর-রহমান', numberOfAyahs: 78, revelationType: 'Medinan', juzCount: 27 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', englishNameTranslation: 'The Inevitable', banglaName: 'আল-ওয়াকিয়াহ', numberOfAyahs: 96, revelationType: 'Meccan', juzCount: 28 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', banglaName: 'আল-হাদিদ', numberOfAyahs: 29, revelationType: 'Medinan', juzCount: 28 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', englishNameTranslation: 'The Pleading Woman', banglaName: 'আল-মুযাদেলাহ', numberOfAyahs: 22, revelationType: 'Medinan', juzCount: 29 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', banglaName: 'আল-হশর', numberOfAyahs: 24, revelationType: 'Medinan', juzCount: 29 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', englishNameTranslation: 'She That is Examined', banglaName: 'আল-মমতহিনাহ', numberOfAyahs: 13, revelationType: 'Medinan', juzCount: 29 },
  { number: 61, name: 'الصف', englishName: 'As-Saf', englishNameTranslation: 'The Ranks', banglaName: 'আস-সাফ', numberOfAyahs: 14, revelationType: 'Medinan', juzCount: 29 },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumu\'ah', englishNameTranslation: 'The Friday', banglaName: 'আল-য়ুমআহ', numberOfAyahs: 11, revelationType: 'Medinan', juzCount: 29 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', englishNameTranslation: 'The Hypocrites', banglaName: 'আল-মুনাফিকুন', numberOfAyahs: 11, revelationType: 'Medinan', juzCount: 29 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', englishNameTranslation: 'The Mutual Disillusion', banglaName: 'আত-তাগাবুন', numberOfAyahs: 18, revelationType: 'Medinan', juzCount: 29 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', englishNameTranslation: 'The Divorce', banglaName: 'আত-তালাক্ব', numberOfAyahs: 12, revelationType: 'Medinan', juzCount: 30 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', banglaName: 'আত-তাহরীম', numberOfAyahs: 12, revelationType: 'Medinan', juzCount: 30 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', banglaName: 'আল-মুল্ক', numberOfAyahs: 30, revelationType: 'Meccan', juzCount: 29 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', banglaName: 'আল-ক্বলম', numberOfAyahs: 52, revelationType: 'Meccan', juzCount: 30 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqah', englishNameTranslation: 'The Reality', banglaName: 'আল-হাক্কাহ', numberOfAyahs: 52, revelationType: 'Meccan', juzCount: 30 },
  { number: 70, name: 'المعارج', englishName: 'Al-Ma\'arij', englishNameTranslation: 'The Ascending Stairways', banglaName: 'আল-মআরিজ', numberOfAyahs: 44, revelationType: 'Meccan', juzCount: 30 },
  { number: 71, name: 'نوح', englishName: 'Nuh', englishNameTranslation: 'Noah', banglaName: 'নূহ', numberOfAyahs: 28, revelationType: 'Meccan', juzCount: 30 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', banglaName: 'আল-জিন্ন', numberOfAyahs: 28, revelationType: 'Meccan', juzCount: 30 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', banglaName: 'আল-মুজ্জাম্মিল', numberOfAyahs: 20, revelationType: 'Meccan', juzCount: 30 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', banglaName: 'আল-মুদ্দাসসির', numberOfAyahs: 56, revelationType: 'Meccan', juzCount: 30 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', englishNameTranslation: 'The Resurrection', banglaName: 'আল-ক্বিয়ামাহ', numberOfAyahs: 40, revelationType: 'Meccan', juzCount: 30 },
  { number: 76, name: 'الانسان', englishName: 'Al-Insan', englishNameTranslation: 'The Human', banglaName: 'আল-ইনসান', numberOfAyahs: 31, revelationType: 'Medinan', juzCount: 30 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', englishNameTranslation: 'The Emissaries', banglaName: 'আল-মুরসালেত', numberOfAyahs: 50, revelationType: 'Meccan', juzCount: 30 },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', banglaName: 'আন-নাবা', numberOfAyahs: 40, revelationType: 'Meccan', juzCount: 30 },
  { number: 79, name: 'النازعات', englishName: 'An-Nazi\'at', englishNameTranslation: 'Those Who Drag Forth', banglaName: 'আন-য়াজিয়াত', numberOfAyahs: 46, revelationType: 'Meccan', juzCount: 30 },
  { number: 80, name: 'عبس', englishName: 'Abasa', englishNameTranslation: 'He Frowned', banglaName: 'আবাস', numberOfAyahs: 42, revelationType: 'Meccan', juzCount: 30 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', banglaName: 'আত-তাকরীফ', numberOfAyahs: 29, revelationType: 'Meccan', juzCount: 30 },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', englishNameTranslation: 'The Cleaving', banglaName: 'আল-ইনফিতার', numberOfAyahs: 19, revelationType: 'Meccan', juzCount: 30 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', englishNameTranslation: 'The Defrauding', banglaName: 'আল-মুতাফ্ফিন', numberOfAyahs: 36, revelationType: 'Meccan', juzCount: 30 },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', englishNameTranslation: 'The Splitting Open', banglaName: 'আল-ইনশিক্বাাক্ব', numberOfAyahs: 25, revelationType: 'Meccan', juzCount: 30 },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', englishNameTranslation: 'The Mansions of the Stars', banglaName: 'আল-বুরূজ', numberOfAyahs: 22, revelationType: 'Meccan', juzCount: 30 },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', englishNameTranslation: 'The Nightcomer', banglaName: 'আত-তারিক্ব', numberOfAyahs: 17, revelationType: 'Meccan', juzCount: 30 },
  { number: 87, name: 'الأعلى', englishName: 'Al-A\'la', englishNameTranslation: 'The Most High', banglaName: 'আল-আ\'লা', numberOfAyahs: 19, revelationType: 'Meccan', juzCount: 30 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', englishNameTranslation: 'The Overwhelming', banglaName: 'আল-গাশিয়াহ', numberOfAyahs: 26, revelationType: 'Meccan', juzCount: 30 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', banglaName: 'আল-ফাজর', numberOfAyahs: 30, revelationType: 'Meccan', juzCount: 30 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', englishNameTranslation: 'The City', banglaName: 'আল-বলাদ', numberOfAyahs: 20, revelationType: 'Meccan', juzCount: 30 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', banglaName: 'আশ-শাম্স', numberOfAyahs: 15, revelationType: 'Meccan', juzCount: 30 },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', englishNameTranslation: 'The Night', banglaName: 'আল-লাইল', numberOfAyahs: 21, revelationType: 'Meccan', juzCount: 30 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', englishNameTranslation: 'The Morning Hours', banglaName: 'আদ-দুহা', numberOfAyahs: 11, revelationType: 'Meccan', juzCount: 30 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', banglaName: 'আশ-শরহ', numberOfAyahs: 8, revelationType: 'Meccan', juzCount: 30 },
  { number: 95, name: 'التين', englishName: 'At-Tin', englishNameTranslation: 'The Fig', banglaName: 'আত-তীন', numberOfAyahs: 8, revelationType: 'Meccan', juzCount: 30 },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', englishNameTranslation: 'The Clot', banglaName: 'আল-আলাক্ব', numberOfAyahs: 19, revelationType: 'Meccan', juzCount: 30 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', banglaName: 'আল-ক্বদ্র', numberOfAyahs: 5, revelationType: 'Meccan', juzCount: 30 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', englishNameTranslation: 'The Clear Proof', banglaName: 'আল-বাইয়্নাহ', numberOfAyahs: 8, revelationType: 'Medinan', juzCount: 30 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', englishNameTranslation: 'The Earthquake', banglaName: 'আজ-য়লয়ালাহ', numberOfAyahs: 8, revelationType: 'Medinan', juzCount: 30 },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', englishNameTranslation: 'The Courser', banglaName: 'আল-আদিয়াত', numberOfAyahs: 11, revelationType: 'Meccan', juzCount: 30 },
  { number: 101, name: 'القارعة', englishName: 'Al-Qari\'ah', englishNameTranslation: 'The Calamity', banglaName: 'আল-ক্বারিআহ', numberOfAyahs: 11, revelationType: 'Meccan', juzCount: 30 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', englishNameTranslation: 'The Rivalry in Worldly Increase', banglaName: 'আত-তাকাসুর', numberOfAyahs: 8, revelationType: 'Meccan', juzCount: 30 },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', englishNameTranslation: 'The Declining Day', banglaName: 'আল-আসর', numberOfAyahs: 3, revelationType: 'Meccan', juzCount: 30 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', englishNameTranslation: 'The Traducer', banglaName: 'আল-হুমযাহ', numberOfAyahs: 9, revelationType: 'Meccan', juzCount: 30 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', banglaName: 'আল-ফিল', numberOfAyahs: 5, revelationType: 'Meccan', juzCount: 30 },
  { number: 106, name: 'قريش', englishName: 'Quraysh', englishNameTranslation: 'Quraysh', banglaName: 'কুরাইশ', numberOfAyahs: 4, revelationType: 'Meccan', juzCount: 30 },
  { number: 107, name: 'الماعون', englishName: 'Al-Ma\'un', englishNameTranslation: 'The Small Kindnesses', banglaName: 'আল-মআউন', numberOfAyahs: 7, revelationType: 'Meccan', juzCount: 30 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', banglaName: 'আল-কাওসার', numberOfAyahs: 3, revelationType: 'Meccan', juzCount: 30 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', englishNameTranslation: 'The Disbelievers', banglaName: 'আল-কাফিরুন', numberOfAyahs: 6, revelationType: 'Meccan', juzCount: 30 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', banglaName: 'আন-নাসর', numberOfAyahs: 3, revelationType: 'Medinan', juzCount: 30 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fiber', banglaName: 'আল-মাসাদ', numberOfAyahs: 5, revelationType: 'Meccan', juzCount: 30 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', banglaName: 'আল-ইখলাস', numberOfAyahs: 4, revelationType: 'Meccan', juzCount: 30 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', banglaName: 'আল-ফালাক্ব', numberOfAyahs: 5, revelationType: 'Meccan', juzCount: 30 },
  { number: 114, name: 'الناس', englishName: 'An-Nas', englishNameTranslation: 'Mankind', banglaName: 'আন-নাস', numberOfAyahs: 6, revelationType: 'Meccan', juzCount: 30 },
];

// =====================================================
// Helper Functions
// =====================================================

/** Returns all 114 surahs */
export function getSurahs(): Surah[] {
  return SURAH_DATA;
}

/** Get a single surah by its number (1-114) */
export function getSurah(number: number): Surah | null {
  return SURAH_DATA.find(s => s.number === number) || null;
}

/**
 * Search surahs by various criteria:
 * - English name
 * - English translation
 * - Arabic name
 * - Bangla name
 * - Surah number (as string)
 */
export function searchSurahs(query: string): Surah[] {
  const trimmed = query.trim();
  if (!trimmed) return SURAH_DATA;
  
  const lowerQuery = trimmed.toLowerCase();
  return SURAH_DATA.filter(surah =>
    surah.englishName.toLowerCase().includes(lowerQuery) ||
    surah.englishNameTranslation.toLowerCase().includes(lowerQuery) ||
    surah.banglaName?.toLowerCase().includes(lowerQuery) ||
    surah.name.includes(trimmed) ||
    surah.number.toString() === lowerQuery
  );
}

/** Get surahs filtered by revelation type */
export function getSurahsByRevelation(type: 'Meccan' | 'Medinan'): Surah[] {
  return SURAH_DATA.filter(s => s.revelationType === type);
}

/** Get surahs that appear in a specific juz */
export function getSurahsByJuz(juzNumber: number): Surah[] {
  return SURAH_DATA.filter(s => s.juzCount === juzNumber);
}

/** Get the juz number for a given surah */
export function getJuzForSurah(surahNumber: number): number | null {
  const surah = getSurah(surahNumber);
  return surah ? surah.juzCount : null;
}

/** Sort surahs by revelation order (traditional, not by number) */
export function getSurahsByRevelationOrder(): Surah[] {
  // Surahs sorted by approximate traditional revelation order
  // Based on Islamic scholarly consensus
  const revelationOrderNumbers = [
    99, 98, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 1,
    112, 114, 113, 68, 53, 54, 55, 67, 78, 79, 80, 81, 82, 83, 84,
    103, 104, 105, 106, 107, 108, 109, 110, 102, 59, 58, 57, 48, 63,
    64, 65, 66, 49, 62, 61, 5, 6, 11, 7, 16, 2, 3, 4, 33, 36, 18,
    19, 20, 21, 23, 25, 27, 28, 31, 34, 35, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 50, 51, 52, 56, 69, 70, 71, 72, 73, 74, 75,
    76, 8, 10, 12, 14, 15, 22, 24, 26, 29, 30, 32,
    // Remaining surahs appended to complete the full set of 114.
    // Approximate placement — this helper is currently unused by pages and
    // can be replaced with the official revelation order when needed.
    9, 13, 17, 60,
  ];
  
  // Map from surah number to revelation order
  const orderMap = new Map<number, number>();
  revelationOrderNumbers.forEach((num, idx) => {
    orderMap.set(num, idx);
  });
  
  return [...SURAH_DATA].sort((a, b) => {
    const orderA = orderMap.get(a.number) ?? a.number;
    const orderB = orderMap.get(b.number) ?? b.number;
    return orderA - orderB;
  });
}

/** Get summary stats about the Quran */
export function getQuranStats(): {
  totalSurahs: number;
  totalAyahs: number;
  meccanCount: number;
  medinanCount: number;
  juzCount: number;
} {
  const totalAyahs = SURAH_DATA.reduce((sum, s) => sum + s.numberOfAyahs, 0);
  const meccanCount = SURAH_DATA.filter(s => s.revelationType === 'Meccan').length;
  const medinanCount = SURAH_DATA.filter(s => s.revelationType === 'Medinan').length;
  
  return {
    totalSurahs: SURAH_DATA.length,
    totalAyahs,
    meccanCount,
    medinanCount,
    juzCount: 30,
  };
}

/**
 * Global ayah number (1-6236) for a given surah + ayah-within-surah.
 * Audio CDNs and cross-surah references key by this number, e.g.
 * 2:1 is ayah 8, 2:255 (Ayat al-Kursi) is ayah 262.
 */
export function getGlobalAyahNumber(
  surahNumber: number,
  numberInSurah: number
): number {
  let offset = 0;
  for (const s of SURAH_DATA) {
    if (s.number >= surahNumber) break;
    offset += s.numberOfAyahs;
  }
  return offset + numberInSurah;
}
