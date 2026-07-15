import 'package:hive/hive.dart';
import '../../config/constants.dart';
import '../models/bookmark.dart';
import '../models/reading_position.dart';

class SettingsRepository {
  final Box _settingsBox;

  SettingsRepository(this._settingsBox);

  // Theme
  bool get isDarkMode =>
      _settingsBox.get('isDarkMode', defaultValue: false) as bool;
  set isDarkMode(bool value) => _settingsBox.put('isDarkMode', value);

  // Font Sizes
  double get arabicFontSize =>
      (_settingsBox.get('arabicFontSize',
              defaultValue: AppConstants.defaultArabicFontSize) as num)
          .toDouble();
  set arabicFontSize(double value) => _settingsBox.put('arabicFontSize', value);

  double get translationFontSize =>
      (_settingsBox.get('translationFontSize',
              defaultValue: AppConstants.defaultTranslationFontSize) as num)
          .toDouble();
  set translationFontSize(double value) =>
      _settingsBox.put('translationFontSize', value);

  double get transliterationFontSize =>
      (_settingsBox.get('transliterationFontSize',
              defaultValue: AppConstants.defaultTransliterationFontSize) as num)
          .toDouble();
  set transliterationFontSize(double value) =>
      _settingsBox.put('transliterationFontSize', value);

  // Visibility Toggles
  bool get showArabic =>
      _settingsBox.get('showArabic', defaultValue: true) as bool;
  set showArabic(bool value) => _settingsBox.put('showArabic', value);

  bool get showTranslation =>
      _settingsBox.get('showTranslation', defaultValue: true) as bool;
  set showTranslation(bool value) => _settingsBox.put('showTranslation', value);

  bool get showTransliteration =>
      _settingsBox.get('showTransliteration', defaultValue: false) as bool;
  set showTransliteration(bool value) =>
      _settingsBox.put('showTransliteration', value);

  bool get showBanglaPronunciation =>
      _settingsBox.get('showBanglaPronunciation', defaultValue: false) as bool;
  set showBanglaPronunciation(bool value) =>
      _settingsBox.put('showBanglaPronunciation', value);

  // Reading Mode
  bool get distractionFreeMode =>
      _settingsBox.get('distractionFreeMode', defaultValue: false) as bool;
  set distractionFreeMode(bool value) =>
      _settingsBox.put('distractionFreeMode', value);

  // Audio
  String get defaultReciter =>
      _settingsBox.get('defaultReciter',
              defaultValue: AppConstants.defaultReciterId) as String;
  set defaultReciter(String value) => _settingsBox.put('defaultReciter', value);

  double get playbackSpeed =>
      (_settingsBox.get('playbackSpeed',
              defaultValue: AppConstants.defaultPlaybackSpeed) as num)
          .toDouble();
  set playbackSpeed(double value) => _settingsBox.put('playbackSpeed', value);

  bool get autoPlayNextSurah =>
      _settingsBox.get('autoPlayNextSurah', defaultValue: false) as bool;
  set autoPlayNextSurah(bool value) =>
      _settingsBox.put('autoPlayNextSurah', value);

  // Daily Reminder
  bool get dailyReminderEnabled =>
      _settingsBox.get('dailyReminderEnabled', defaultValue: false) as bool;
  set dailyReminderEnabled(bool value) =>
      _settingsBox.put('dailyReminderEnabled', value);

  String? get dailyReminderTime =>
      _settingsBox.get('dailyReminderTime') as String?;
  set dailyReminderTime(String? value) =>
      _settingsBox.put('dailyReminderTime', value);

  // Onboarding
  bool get onboardingComplete =>
      _settingsBox.get('onboardingComplete', defaultValue: false) as bool;
  set onboardingComplete(bool value) =>
      _settingsBox.put('onboardingComplete', value);

  // Translation Language
  String get translationLanguage =>
      _settingsBox.get('translationLanguage',
              defaultValue: 'bn.bengali') as String;
  set translationLanguage(String value) =>
      _settingsBox.put('translationLanguage', value);

  // Clear all settings
  void clear() => _settingsBox.clear();
}

class BookmarkRepository {
  final Box _bookmarksBox;

  BookmarkRepository(this._bookmarksBox);

  List<Bookmark> getAllBookmarks() {
    final bookmarks = <Bookmark>[];
    for (final key in _bookmarksBox.keys) {
      final json = _bookmarksBox.get(key) as Map<String, dynamic>?;
      if (json != null) {
        bookmarks.add(Bookmark.fromJson(json));
      }
    }
    bookmarks.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return bookmarks;
  }

  Future<void> addBookmark(Bookmark bookmark) async {
    await _bookmarksBox.put(bookmark.id, bookmark.toJson());
  }

  Future<void> removeBookmark(String id) async {
    await _bookmarksBox.delete(id);
  }

  bool isBookmarked(int surahNumber, int ayahNumber) {
    final id = '${surahNumber}_$ayahNumber';
    return _bookmarksBox.containsKey(id);
  }

  Future<void> updateBookmarkNote(String id, String note) async {
    final existing = _bookmarksBox.get(id) as Map<String, dynamic>?;
    if (existing != null) {
      existing['note'] = note;
      await _bookmarksBox.put(id, existing);
    }
  }

  List<Bookmark> searchBookmarks(String query) {
    final q = query.toLowerCase();
    return getAllBookmarks().where((b) {
      return b.surahName.toLowerCase().contains(q) ||
          (b.textPreview?.toLowerCase().contains(q) ?? false) ||
          (b.note?.toLowerCase().contains(q) ?? false);
    }).toList();
  }
}

class LastReadRepository {
  final Box _lastReadBox;

  LastReadRepository(this._lastReadBox);

  ReadingPosition? getLastReadPosition() {
    final json = _lastReadBox.get('lastPosition') as Map<String, dynamic>?;
    if (json == null) return null;
    return ReadingPosition.fromJson(json);
  }

  Future<void> saveLastReadPosition(ReadingPosition position) async {
    await _lastReadBox.put('lastPosition', position.toJson());
  }

  Future<void> clearLastReadPosition() async {
    await _lastReadBox.delete('lastPosition');
  }
}

class SearchHistoryRepository {
  final Box _searchBox;

  SearchHistoryRepository(this._searchBox);

  List<String> getRecentSearches() {
    final searches = _searchBox.get('searches') as List<dynamic>?;
    return searches?.cast<String>() ?? [];
  }

  Future<void> addSearch(String query) async {
    final searches = getRecentSearches();
    searches.remove(query);
    searches.insert(0, query);
    if (searches.length > AppConstants.maxSearchHistory) {
      searches.removeLast();
    }
    await _searchBox.put('searches', searches);
  }

  Future<void> clearSearches() async {
    await _searchBox.delete('searches');
  }
}
