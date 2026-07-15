import 'package:flutter_test/flutter_test.dart';
import 'package:al_quran/core/models/surah.dart';

void main() {
  group('Surah Model', () {
    test('should create Surah instance with valid data', () {
      // Arrange
      const surah = Surah(
        number: 1,
        name: 'Al-Fatiha',
        nameArabic: 'الفاتحة',
        englishName: 'The Opening',
        englishNameTranslation: 'The Opening',
        revelation: RevelationType.makkan,
        numberOfAyahs: 7,
        verses: [],
      );

      // Act
      final surahCopy = Surah(
        number: surah.number,
        name: surah.name,
        nameArabic: surah.nameArabic,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        revelation: surah.revelation,
        numberOfAyahs: surah.numberOfAyahs,
        verses: surah.verses,
      );

      // Assert
      expect(surah.number, equals(1));
      expect(surah.name, equals('Al-Fatiha'));
      expect(surah.nameArabic, equals('الفاتحة'));
      expect(surah.englishName, equals('The Opening'));
      expect(surah.revelation, equals(RevelationType.makkan));
      expect(surah.numberOfAyahs, equals(7));
    });

    test('should have correct revelation type identifiers', () {
      expect(RevelationType.makkan, 0);
      expect(RevelationType.medinan, 1);
    });
  });
}
