class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Al Quran';
  static const String appVersion = '1.0.0';
  static const String packageName = 'com.alquran.app';

  // APIs
  static const String alQuranCloudBaseUrl = 'https://api.alquran.cloud/v1';
  static const String quranComBaseUrl = 'https://api.quran.com/api/v4';
  static const String everyAyahBaseUrl = 'https://everyayah.com/data/';

  // Storage
  static const String settingsBox = 'settings';
  static const String bookmarksBox = 'bookmarks';
  static const String lastReadBox = 'lastRead';
  static const String cacheBox = 'cache';
  static const String searchHistoryBox = 'searchHistory';

  // Cache
  static const int cacheExpiryDays = 7;
  static const int maxSearchHistory = 20;

  // UI
  static const double defaultArabicFontSize = 28.0;
  static const double defaultTranslationFontSize = 16.0;
  static const double defaultTransliterationFontSize = 14.0;
  static const double minArabicFontSize = 18.0;
  static const double maxArabicFontSize = 48.0;
  static const double minTranslationFontSize = 12.0;
  static const double maxTranslationFontSize = 28.0;

  // Audio
  static const double defaultPlaybackSpeed = 1.0;
  static const String defaultReciterId = 'Alafasy_128kbps';

  // Asset paths
  static const String surahsDataPath = 'assets/data/surahs.json';
  static const String quranUthmaniPath = 'assets/data/quran-uthmani.json';
  static const String bnBengaliPath = 'assets/data/bn.bengali.json';
  static const String enSahihPath = 'assets/data/en.sahih.json';
  static const String enTransliterationPath =
      'assets/data/en.transliteration.json';
  static const String banglaPronunciationPath =
      'assets/data/bangla_pronunciation.json';
}
