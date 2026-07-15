class ApiEndpoints {
  ApiEndpoints._();

  // AlQuran Cloud API
  static const String allSurahs = '/surah';
  static String surah(int number) => '/surah/$number';
  static String surahWithEdition(int number, String edition) =>
      '/surah/$number/$edition';
  static String ayah(String reference, String edition) =>
      '/ayah/$reference/$edition';
  static String search(String keyword, {String surah = 'all', String edition = 'en.asad'}) =>
      '/search/$keyword/$surah/$edition';
  static const String editions = '/edition';

  // Quran.com API v4
  static const String chapters = '/chapters';
  static String versesByChapter(int chapterId) =>
      '/verses/by_chapter/$chapterId';
  static const String tafsirs = '/resources/tafsirs';
  static String tafsirByAyah(int tafsirId, String ayahKey) =>
      '/tafsirs/$tafsirId/by_ayah/$ayahKey';

  // Audio
  static String audioUrl(String reciter, int surah, int ayah) =>
      'https://everyayah.com/data/${reciter}/${_padNumber(surah)}${_padNumber(ayah)}.mp3';

  static String _padNumber(int number) => number.toString().padLeft(3, '0');
}
