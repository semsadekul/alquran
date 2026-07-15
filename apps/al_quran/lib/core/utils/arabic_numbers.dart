class ArabicNumbers {
  static const Map<int, String> _arabicDigits = {
    0: '٠',
    1: '١',
    2: '٢',
    3: '٣',
    4: '٤',
    5: '٥',
    6: '٦',
    7: '٧',
    8: '٨',
    9: '٩',
  };

  static const Map<int, String> _easternDigits = {
    0: '۰',
    1: '۱',
    2: '۲',
    3: '۳',
    4: '۴',
    5: '۵',
    6: '۶',
    7: '۷',
    8: '۸',
    9: '۹',
  };

  /// Convert Western number (int) to Arabic (Uthmani) numeral string
  static String toArabic(int number) {
    return number
        .toString()
        .split('')
        .map((c) => _arabicDigits[int.parse(c)] ?? c)
        .join();
  }

  /// Convert Western number to Eastern/Persian numeral string
  static String toEastern(int number) {
    return number
        .toString()
        .split('')
        .map((c) => _easternDigits[int.parse(c)] ?? c)
        .join();
  }
}
