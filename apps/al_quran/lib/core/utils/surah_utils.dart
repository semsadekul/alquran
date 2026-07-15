import '../models/surah.dart';

class SurahUtils {
  /// Get the Juz number for a given surah and ayah
  /// Based on standard Hafs Quran juz divisions
  static int getJuzForAyah(int surahNumber, int ayahNumber) {
    // Standard Juz boundaries (surah:ayah at start of each juz)
    const juzBoundaries = [
      {1: 1},    // Juz 1
      {2: 142},  // Juz 2
      {2: 253},  // Juz 3
      {3: 93},   // Juz 4
      {4: 24},   // Juz 5
      {4: 148},  // Juz 6
      {5: 82},   // Juz 7
      {6: 111},  // Juz 8
      {7: 88},   // Juz 9
      {8: 41},   // Juz 10
      {9: 93},   // Juz 11
      {11: 6},   // Juz 12
      {12: 53},  // Juz 13
      {15: 1},   // Juz 14
      {17: 1},   // Juz 15
      {18: 75},  // Juz 16
      {21: 1},   // Juz 17
      {23: 1},   // Juz 18
      {25: 21},  // Juz 19
      {27: 56},  // Juz 20
      {29: 46},  // Juz 21
      {33: 31},  // Juz 22
      {36: 28},  // Juz 23
      {39: 32},  // Juz 24
      {41: 47},  // Juz 25
      {46: 1},   // Juz 26
      {51: 31},  // Juz 27
      {58: 1},   // Juz 28
      {67: 1},   // Juz 29
      {78: 1},   // Juz 30
    ];

    for (int i = juzBoundaries.length - 1; i >= 0; i--) {
      final boundary = juzBoundaries[i];
      final boundarySurah = boundary.keys.first;
      if (surahNumber > boundarySurah ||
          (surahNumber == boundarySurah && ayahNumber >= boundary.values.first)) {
        return i + 1;
      }
    }
    return 1;
  }

  /// Check if a surah starts with Bismillah
  static bool hasBismillah(int surahNumber) {
    return surahNumber != 1 && surahNumber != 9;
  }

  /// Get revelation type display name
  static String revelationTypeDisplay(RevelationType type) {
    return type == RevelationType.meccan ? 'Meccan' : 'Medinan';
  }

  /// Get revelation type in Arabic
  static String revelationTypeArabic(RevelationType type) {
    return type == RevelationType.meccan ? 'مكية' : 'مدنية';
  }

  /// Format "x Ayahs" string
  static String ayahsCount(int count) {
    return '$count Ayahs';
  }

  /// Format "Surah X: Y" reference
  static String surahReference(int surahNumber, int ayahNumber) {
    return '$surahNumber:$ayahNumber';
  }
}
