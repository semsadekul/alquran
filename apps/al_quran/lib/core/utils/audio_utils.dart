import '../api/endpoints.dart';
import '../models/reciter.dart';

class AudioUtils {
  /// Get the streaming URL for a specific ayah by a reciter
  static String getAyahAudioUrl({
    required int surahNumber,
    required int ayahNumber,
    String reciterId = 'Alafasy_128kbps',
  }) {
    return ApiEndpoints.audioUrl(reciterId, surahNumber, ayahNumber);
  }

  /// Get the streaming URL for an entire surah (sequential ayahs)
  static List<String> getSurahAudioUrls({
    required int surahNumber,
    required int totalAyahs,
    String reciterId = 'Alafasy_128kbps',
  }) {
    final urls = <String>[];
    for (int i = 1; i <= totalAyahs; i++) {
      urls.add(getAyahAudioUrl(
        surahNumber: surahNumber,
        ayahNumber: i,
        reciterId: reciterId,
      ));
    }
    return urls;
  }

  /// Format audio duration in seconds to mm:ss
  static String formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  /// Get reciter by ID
  static Reciter? getReciterById(String id) {
    try {
      return Reciter.defaults.firstWhere((r) => r.id == id);
    } catch (_) {
      return Reciter.defaults.first;
    }
  }
}
