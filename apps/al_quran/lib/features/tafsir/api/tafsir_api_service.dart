import 'package:collection/collection.dart';
import 'package:dio/dio.dart';
import '../../config/constants.dart';
import '../../core/models/tafsir.dart';
import '../../core/api/api_client.dart';

class TafsirApiService {
  final ApiClient _apiClient;
  List<Tafsir>? _cachedTafsirs;

  TafsirApiService()
      : _apiClient = ApiClient(
          baseUrl: AppConstants.quranComBaseUrl,
        );

  /// Fetch available tafsir resources
  Future<List<Tafsir>> getTafsirs() async {
    if (_cachedTafsirs != null) return _cachedTafsirs!;

    try {
      final response = await _apiClient.get('/resources/tafsirs');
      final data = response.data['tafsirs'] as List<dynamic>;
      _cachedTafsirs = data
          .map((json) => Tafsir.fromJson(json as Map<String, dynamic>))
          .toList();
      return _cachedTafsirs!;
    } on DioException {
      // Return default tafsirs if API fails
      return _defaultTafsirs;
    }
  }

  /// Fetch tafsir content for a specific ayah
  Future<TafsirContent> getTafsirContent({
    required int tafsirId,
    required int surahNumber,
    required int ayahNumber,
  }) async {
    final ayahKey = '$surahNumber:$ayahNumber';

    try {
      final response =
          await _apiClient.get('/tafsirs/$tafsirId/by_ayah/$ayahKey');
      final data = response.data['tafsir'] as Map<String, dynamic>;
      final text = data['text'] as String? ?? '';

      final tafsir = await getTafsirs();
      final tafsirName = tafsir
          .where((t) => t.id == tafsirId)
          .map((t) => t.name)
          .firstOrNull;

      return TafsirContent(
        surahNumber: surahNumber,
        ayahNumber: ayahNumber,
        text: text,
        tafsirName: tafsirName,
      );
    } on DioException {
      // Return placeholder if API call fails
      return TafsirContent(
        surahNumber: surahNumber,
        ayahNumber: ayahNumber,
        text: 'Tafsir content is currently unavailable. '
            'Please check your internet connection and try again.',
        tafsirName: 'Tafsir',
      );
    }
  }

  /// Fallback default tafsirs (always available)
  List<Tafsir> get _defaultTafsirs => const [
        Tafsir(
          id: 169,
          name: 'Tafsir Ibn Kathir',
          authorName: 'Ibn Kathir',
          slug: 'tafsir-ibn-kathir',
          language: 'en',
        ),
        Tafsir(
          id: 170,
          name: 'Tafsir al-Jalalayn',
          authorName: 'Jalal ad-Din al-Mahalli & Jalal ad-Din as-Suyuti',
          slug: 'tafsir-al-jalalayn',
          language: 'en',
        ),
        Tafsir(
          id: 171,
          name: 'Tafsir al-Tabari',
          authorName: 'Muhammad ibn Jarir al-Tabari',
          slug: 'tafsir-al-tabari',
          language: 'ar',
        ),
        Tafsir(
          id: 172,
          name: 'Tafsir al-Sa\'di',
          authorName: 'Abd al-Rahman al-Sa\'di',
          slug: 'tafsir-al-sadi',
          language: 'en',
        ),
      ];
}
