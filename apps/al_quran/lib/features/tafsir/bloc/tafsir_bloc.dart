import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/models/tafsir.dart';
import 'tafsir_api_service.dart';

// ---- States ----

abstract class TafsirState {}

class TafsirInitial extends TafsirState {}

class TafsirLoading extends TafsirState {
  final List<Tafsir> tafsirs;

  TafsirLoading({required this.tafsirs});
}

class TafsirLoaded extends TafsirState {
  final List<Tafsir> tafsirs;
  final int selectedTafsirId;
  final TafsirContent content;
  final bool isLoadingContent;

  TafsirLoaded({
    required this.tafsirs,
    required this.selectedTafsirId,
    required this.content,
    this.isLoadingContent = false,
  });

  TafsirLoaded copyWith({
    List<Tafsir>? tafsirs,
    int? selectedTafsirId,
    TafsirContent? content,
    bool? isLoadingContent,
  }) {
    return TafsirLoaded(
      tafsirs: tafsirs ?? this.tafsirs,
      selectedTafsirId: selectedTafsirId ?? this.selectedTafsirId,
      content: content ?? this.content,
      isLoadingContent: isLoadingContent ?? this.isLoadingContent,
    );
  }
}

class TafsirError extends TafsirState {
  final String message;

  TafsirError(this.message);
}

// ---- BLoC ----

class TafsirBloc extends Cubit<TafsirState> {
  final TafsirApiService _apiService;
  final int surahNumber;
  final int ayahNumber;

  TafsirBloc({
    required int surahNumber,
    required int ayahNumber,
    TafsirApiService? apiService,
  })  : _apiService = apiService ?? TafsirApiService(),
        surahNumber = surahNumber,
        ayahNumber = ayahNumber,
        super(TafsirInitial());

  Future<void> loadTafsirs() async {
    emit(TafsirLoading(tafsirs: []));
    try {
      final tafsirs = await _apiService.getTafsirs();
      if (tafsirs.isEmpty) {
        emit(TafsirError('No tafsirs available'));
        return;
      }
      // Load content for the first tafsir
      final firstTafsirId = tafsirs.first.id;
      final content = await _apiService.getTafsirContent(
        tafsirId: firstTafsirId,
        surahNumber: surahNumber,
        ayahNumber: ayahNumber,
      );
      emit(TafsirLoaded(
        tafsirs: tafsirs,
        selectedTafsirId: firstTafsirId,
        content: content,
      ));
    } catch (e) {
      emit(TafsirError('Failed to load tafsir: $e'));
    }
  }

  Future<void> selectTafsir(int tafsirId) async {
    final state = this.state;
    if (state is TafsirLoaded) {
      emit(state.copyWith(isLoadingContent: true));
      try {
        final content = await _apiService.getTafsirContent(
          tafsirId: tafsirId,
          surahNumber: surahNumber,
          ayahNumber: ayahNumber,
        );
        emit(state.copyWith(
          selectedTafsirId: tafsirId,
          content: content,
          isLoadingContent: false,
        ));
      } catch (e) {
        emit(state.copyWith(isLoadingContent: false));
      }
    }
  }
}
