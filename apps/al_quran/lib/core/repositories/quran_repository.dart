import 'dart:convert';
import 'package:flutter/services.dart';
import '../../config/constants.dart';
import '../models/surah.dart';
import '../models/ayah.dart';

class QuranRepository {
  List<Surah>? _cachedSurahs;
  Map<int, List<Ayah>> _ayahCache = {};

  // ---- Surah Methods ----

  Future<List<Surah>> getSurahs() async {
    if (_cachedSurahs != null) return _cachedSurahs!;

    final jsonString = await rootBundle.loadString(AppConstants.surahsDataPath);
    final decoded = json.decode(jsonString) as Map<String, dynamic>;
    final data = decoded['data'];

    List<dynamic> surahList;
    if (data is List) {
      surahList = data;
    } else if (data is Map<String, dynamic> && data.containsKey('surahs')) {
      surahList = data['surahs'] as List<dynamic>;
    } else {
      throw Exception('Unexpected surahs data format');
    }

    _cachedSurahs = surahList
        .map((s) => Surah.fromJson(s as Map<String, dynamic>))
        .toList();
    return _cachedSurahs!;
  }

  Future<Surah> getSurah(int number) async {
    final surahs = await getSurahs();
    return surahs.firstWhere((s) => s.number == number);
  }

  List<Surah> searchSurahs(String query) {
    if (_cachedSurahs == null) return [];
    final q = query.toLowerCase();
    return _cachedSurahs!.where((s) {
      return s.englishName.toLowerCase().contains(q) ||
          s.englishNameTranslation.toLowerCase().contains(q) ||
          s.name.contains(q) ||
          s.number.toString() == q;
    }).toList();
  }

  List<Surah> filterByRevelationType(RevelationType type) {
    if (_cachedSurahs == null) return [];
    return _cachedSurahs!
        .where((s) => s.revelationType == type)
        .toList();
  }

  // ---- Ayah Methods ----

  Future<List<Ayah>> getAyahs(int surahNumber) async {
    if (_ayahCache.containsKey(surahNumber)) {
      return _ayahCache[surahNumber]!;
    }

    // Load all JSON sources
    final arabicJson =
        await _loadJsonAsset(AppConstants.quranUthmaniPath);
    final banglaJson =
        await _loadJsonAsset(AppConstants.bnBengaliPath);
    final englishJson =
        await _loadJsonAsset(AppConstants.enSahihPath);
    final transliterationJson =
        await _loadJsonAsset(AppConstants.enTransliterationPath);

    // Get the surah's ayahs from each source
    final arabicAyahs = _extractAyahs(arabicJson, surahNumber);
    final banglaAyahs = _extractAyahs(banglaJson, surahNumber);
    final englishAyahs = _extractAyahs(englishJson, surahNumber);
    final transliterationAyahs =
        _extractAyahs(transliterationJson, surahNumber);

    // Load Bangla pronunciation
    final banglaPronJson =
        await rootBundle.loadString(AppConstants.banglaPronunciationPath);
    final banglaPronData =
        json.decode(banglaPronJson) as Map<String, dynamic>;

    // Merge all layers by index
    final ayahs = <Ayah>[];

    for (int i = 0; i < arabicAyahs.length; i++) {
      final arabicAyah = arabicAyahs[i];
      final banglaAyah = i < banglaAyahs.length ? banglaAyahs[i] : null;
      final englishAyah =
          i < englishAyahs.length ? englishAyahs[i] : null;
      final transliterationAyah =
          i < transliterationAyahs.length ? transliterationAyahs[i] : null;

      // Handle legacy fixes for Surah 26 (Ash-Shu'araa)
      String? banglaText = banglaAyah?['text'] as String?;
      String? englishText = englishAyah?['text'] as String?;
      String? transliterationText =
          transliterationAyah?['text'] as String?;

      if (surahNumber == 26) {
        if (arabicAyah['numberInSurah'] == 1) {
          englishText = 'Ta. Sin. Mim.';
          banglaText = 'ত্বা-সীন-মীম।';
        } else if (arabicAyah['numberInSurah'] == 227) {
          englishText =
              'Except for those who believe and do righteous deeds and remember Allah often and defend themselves after they have been wronged. And the wrongdoers are going to know to which [final] place they will return.';
        }
      }

      // Get Bangla pronunciation key
      final globalNumber = arabicAyah['number'] as int;
      final ayahInSurah = arabicAyah['numberInSurah'] as int;
      final pronKey = ayahInSurah == 1
          ? '${surahNumber}_1'
          : '${globalNumber}_$ayahInSurah';
      final banglaPronunciation = banglaPronData[pronKey] as String?;

      ayahs.add(
        Ayah.fromJson(arabicAyah as Map<String, dynamic>).copyWith(
          bangla: banglaText,
          english: englishText,
          transliteration: transliterationText,
          banglaPronunciation: banglaPronunciation,
        ),
      );
    }

    _ayahCache[surahNumber] = ayahs;
    return ayahs;
  }

  Future<Ayah> getAyah(int surahNumber, int ayahNumber) async {
    final ayahs = await getAyahs(surahNumber);
    return ayahs.firstWhere((a) => a.numberInSurah == ayahNumber);
  }

  /// Clear the ayah cache (e.g., when memory pressure is high)
  void clearCache() {
    _ayahCache.clear();
  }

  // ---- Helpers ----

  Future<Map<String, dynamic>> _loadJsonAsset(String path) async {
    final jsonString = await rootBundle.loadString(path);
    return json.decode(jsonString) as Map<String, dynamic>;
  }

  List<dynamic> _extractAyahs(
      Map<String, dynamic> json, int surahNumber) {
    final data = json['data'];
    List<dynamic> surahs;

    if (data is Map<String, dynamic> && data.containsKey('surahs')) {
      surahs = data['surahs'] as List<dynamic>;
    } else if (data is List) {
      surahs = data;
    } else {
      // Direct surah object
      final surah = data as Map<String, dynamic>;
      if (surah['number'] == surahNumber) {
        return surah['ayahs'] as List<dynamic>;
      }
      return [];
    }

    final surahIndex = surahs.indexWhere(
        (s) => (s as Map<String, dynamic>)['number'] == surahNumber);
    if (surahIndex == -1) return [];

    final surah = surahs[surahIndex] as Map<String, dynamic>;
    return surah['ayahs'] as List<dynamic>;
  }
}
