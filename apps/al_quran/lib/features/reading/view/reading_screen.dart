import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/models/surah.dart';
import '../../../core/models/ayah.dart';
import '../../../core/repositories/quran_repository.dart';
import '../../../core/repositories/settings_repository.dart';
import '../../../core/models/bookmark.dart';
import '../../../core/models/reading_position.dart';
import '../../../core/utils/surah_utils.dart';
import '../../../shared/widgets/ayah_card.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/audio_player_bar.dart';
import '../../audio_player/bloc/audio_bloc.dart';
import '../../../core/utils/audio_utils.dart';

// ---- BLoC ----

class ReadingCubit extends Cubit<ReadingState> {
  final QuranRepository _quranRepo;
  final BookmarkRepository _bookmarkRepo;
  final LastReadRepository _lastReadRepo;

  ReadingCubit({
    required QuranRepository quranRepo,
    required BookmarkRepository bookmarkRepo,
    required LastReadRepository lastReadRepo,
  })  : _quranRepo = quranRepo,
        _bookmarkRepo = bookmarkRepo,
        _lastReadRepo = lastReadRepo,
        super(ReadingInitial());

  Future<void> loadSurah(int surahNumber, {int? initialAyah}) async {
    emit(ReadingLoading());
    try {
      final surah = await _quranRepo.getSurah(surahNumber);
      final ayahs = await _quranRepo.getAyahs(surahNumber);
      emit(ReadingLoaded(
        surah: surah,
        ayahs: ayahs,
        currentAyah: initialAyah ?? 1,
        showTranslation: true,
        showTransliteration: false,
        showBanglaPronunciation: false,
        arabicFontSize: 28,
        translationFontSize: 16,
      ));
    } catch (e) {
      emit(ReadingError(e.toString()));
    }
  }

  void setCurrentAyah(int ayahNumber) {
    final state = this.state;
    if (state is ReadingLoaded) {
      emit(state.copyWith(currentAyah: ayahNumber));
    }
  }

  void toggleTranslation() {
    final state = this.state;
    if (state is ReadingLoaded) {
      emit(state.copyWith(showTranslation: !state.showTranslation));
    }
  }

  void toggleTransliteration() {
    final state = this.state;
    if (state is ReadingLoaded) {
      emit(state.copyWith(
          showTransliteration: !state.showTransliteration));
    }
  }

  void toggleBanglaPronunciation() {
    final state = this.state;
    if (state is ReadingLoaded) {
      emit(state.copyWith(
          showBanglaPronunciation: !state.showBanglaPronunciation));
    }
  }

  void setArabicFontSize(double size) {
    final state = this.state;
    if (state is ReadingLoaded) {
      emit(state.copyWith(arabicFontSize: size));
    }
  }

  void setTranslationFontSize(double size) {
    final state = this.state;
    if (state is ReadingLoaded) {
      emit(state.copyWith(translationFontSize: size));
    }
  }

  bool isBookmarked(int surahNumber, int ayahNumber) {
    return _bookmarkRepo.isBookmarked(surahNumber, ayahNumber);
  }

  Future<void> toggleBookmark(int surahNumber, int ayahNumber,
      {String? surahName}) async {
    final id = '${surahNumber}_$ayahNumber';
    if (_bookmarkRepo.isBookmarked(surahNumber, ayahNumber)) {
      await _bookmarkRepo.removeBookmark(id);
    } else {
      final state = this.state;
      String? textPreview;
      if (state is ReadingLoaded && ayahNumber <= state.ayahs.length) {
        final ayah = state.ayahs[ayahNumber - 1];
        textPreview = ayah.bangla ?? ayah.english ?? ayah.text;
        if (textPreview != null && textPreview.length > 50) {
          textPreview = textPreview.substring(0, 50);
        }
      }
      await _bookmarkRepo.addBookmark(
        Bookmark(
          id: id,
          surahNumber: surahNumber,
          ayahNumber: ayahNumber,
          surahName: surahName ?? '',
          textPreview: textPreview,
          timestamp: DateTime.now(),
        ),
      );
    }
    // Refresh state to update bookmark icons
    if (this.state is ReadingLoaded) {
      emit(this.state as ReadingLoaded);
    }
  }

  Future<void> saveLastRead(int surahNumber, int ayahNumber,
      {required String surahName}) async {
    await _lastReadRepo.saveLastReadPosition(
      ReadingPosition(
        surahNumber: surahNumber,
        ayahNumber: ayahNumber,
        surahName: surahName,
        timestamp: DateTime.now(),
      ),
    );
  }
}

// ---- States ----

abstract class ReadingState {}

class ReadingInitial extends ReadingState {}

class ReadingLoading extends ReadingState {}

class ReadingLoaded extends ReadingState {
  final Surah surah;
  final List<Ayah> ayahs;
  final int currentAyah;
  final bool showTranslation;
  final bool showTransliteration;
  final bool showBanglaPronunciation;
  final double arabicFontSize;
  final double translationFontSize;

  ReadingLoaded({
    required this.surah,
    required this.ayahs,
    this.currentAyah = 1,
    this.showTranslation = true,
    this.showTransliteration = false,
    this.showBanglaPronunciation = false,
    this.arabicFontSize = 28,
    this.translationFontSize = 16,
  });

  ReadingLoaded copyWith({
    Surah? surah,
    List<Ayah>? ayahs,
    int? currentAyah,
    bool? showTranslation,
    bool? showTransliteration,
    bool? showBanglaPronunciation,
    double? arabicFontSize,
    double? translationFontSize,
  }) {
    return ReadingLoaded(
      surah: surah ?? this.surah,
      ayahs: ayahs ?? this.ayahs,
      currentAyah: currentAyah ?? this.currentAyah,
      showTranslation: showTranslation ?? this.showTranslation,
      showTransliteration:
          showTransliteration ?? this.showTransliteration,
      showBanglaPronunciation:
          showBanglaPronunciation ?? this.showBanglaPronunciation,
      arabicFontSize: arabicFontSize ?? this.arabicFontSize,
      translationFontSize:
          translationFontSize ?? this.translationFontSize,
    );
  }
}

class ReadingError extends ReadingState {
  final String message;
  ReadingError(this.message);
}

// ---- Screen ----

class ReadingScreen extends StatefulWidget {
  final int surahNumber;
  final int? initialAyah;
  final int? juzNumber;

  const ReadingScreen({
    super.key,
    required this.surahNumber,
    this.initialAyah,
    this.juzNumber,
  });

  @override
  State<ReadingScreen> createState() => _ReadingScreenState();
}

class _ReadingScreenState extends State<ReadingScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Scroll to initial ayah if provided
      if (widget.initialAyah != null && widget.initialAyah! > 1) {
        final offset = (widget.initialAyah! - 1) * 200.0;
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            offset,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      }
    });
  }

  /// Sync reading ayah highlight with audio position
  void _syncWithAudio(BuildContext context, AudioState audioState) {
    if (audioState.ayahIndexOrZero == 0) return;
    final readingState = context.read<ReadingCubit>().state;
    if (readingState is ReadingLoaded) {
      final audioAyah = audioState.ayahIndexOrZero + 1;
      if (readingState.currentAyah != audioAyah) {
        context
            .read<ReadingCubit>()
            .setCurrentAyah(audioAyah);
        // Auto-scroll
        if (_scrollController.hasClients) {
          final offset = (audioAyah - 1) * 200.0;
          _scrollController.animateTo(
            offset.clamp(
                0, _scrollController.position.maxScrollExtent),
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOut,
          );
        }
      }
    }
  }

  @override
  void dispose() {
    // Save last read position
    final state = context.read<ReadingCubit>().state;
    if (state is ReadingLoaded) {
      context.read<ReadingCubit>().saveLastRead(
            state.surah.number,
            state.currentAyah,
            surahName: state.surah.englishName,
          );
    }
    _scrollController.dispose();
    super.dispose();
  }

  void _playCurrentSurah(BuildContext context, ReadingLoaded state) {
    final ayahUrls = AudioUtils.getSurahAudioUrls(
      surahNumber: state.surah.number,
      totalAyahs: state.surah.numberOfAyahs,
    );
    context.read<AudioBloc>().add(PlaySurahEvent(
      surahNumber: state.surah.number,
      ayahUrls: ayahUrls,
      startAyahIndex: state.currentAyah - 1,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final surahNumber = widget.surahNumber;

    return BlocProvider(
      create: (context) {
        final quranRepo = RepositoryProvider.of<QuranRepository>(context);
        final bookmarkRepo =
            RepositoryProvider.of<BookmarkRepository>(context);
        final lastReadRepo =
            RepositoryProvider.of<LastReadRepository>(context);
        return ReadingCubit(
          quranRepo: quranRepo,
          bookmarkRepo: bookmarkRepo,
          lastReadRepo: lastReadRepo,
        )..loadSurah(surahNumber, initialAyah: widget.initialAyah);
      },
      child: BlocListener<AudioBloc, AudioState>(
        listener: _syncWithAudio,
        child: BlocBuilder<ReadingCubit, ReadingState>(
        builder: (context, state) {
          if (state is ReadingLoading) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading...')),
              body: const LoadingShimmer(itemCount: 8),
            );
          }

          if (state is ReadingError) {
            return Scaffold(
              appBar: AppBar(title: const Text('Error')),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48,
                        color: Theme.of(context).colorScheme.error),
                    const SizedBox(height: 16),
                    Text(state.message),
                    TextButton(
                      onPressed: () =>
                          context.read<ReadingCubit>().loadSurah(surahNumber),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is ReadingLoaded) {
            final theme = Theme.of(context);
            return Scaffold(
              appBar: AppBar(
                title: Text(state.surah.englishName),
                actions: [
                  // Play/Pause button
                  BlocBuilder<AudioBloc, AudioState>(
                    builder: (context, audioState) {
                      final isPlaying = audioState is AudioPlayingState &&
                          audioState.surahNumber == state.surah.number;
                      return IconButton(
                        icon: Icon(
                          isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                          color: isPlaying
                              ? theme.colorScheme.primary
                              : theme.colorScheme.onSurface,
                        ),
                        tooltip: isPlaying ? 'Pause' : 'Play Surah',
                        onPressed: () {
                          if (isPlaying) {
                            context.read<AudioBloc>().add(const PauseEvent());
                          } else {
                            _playCurrentSurah(context, state);
                          }
                        },
                      );
                    },
                  ),
                  // Translation Toggle
                  IconButton(
                    icon: Icon(
                      state.showTranslation
                          ? Icons.translate
                          : Icons.translate_outlined,
                    ),
                    tooltip: 'Toggle Translation',
                    onPressed: () =>
                        context.read<ReadingCubit>().toggleTranslation(),
                  ),
                  // Settings
                  IconButton(
                    icon: const Icon(Icons.text_fields),
                    tooltip: 'Reading Settings',
                    onPressed: () => _showReadingSettings(context, state),
                  ),
                ],
              ),
              body: Column(
                children: [
                  // Surah Header
                  _SurahHeader(surah: state.surah),

                  // Audio player bar
                  AudioPlayerBar(
                    surahNumber: state.surah.number,
                    totalAyahs: state.surah.numberOfAyahs,
                  ),

                  // Ayahs List
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.only(bottom: 32),
                      itemCount: state.ayahs.length,
                      itemBuilder: (context, index) {
                        final ayah = state.ayahs[index];
                        final isCurrentAyah =
                            ayah.numberInSurah == state.currentAyah;

                        return AyahCard(
                          ayahNumber: ayah.numberInSurah,
                          arabicText: ayah.text,
                          banglaText: ayah.bangla,
                          translationText: ayah.english,
                          transliterationText: ayah.transliteration,
                          banglaPronunciation: ayah.banglaPronunciation,
                          arabicFontSize: state.arabicFontSize,
                          translationFontSize:
                              state.translationFontSize,
                          showTranslation: state.showTranslation,
                          showTransliteration:
                              state.showTransliteration,
                          showBanglaPronunciation:
                              state.showBanglaPronunciation,
                          isHighlighted: isCurrentAyah,
                          isBookmarked: context
                              .read<ReadingCubit>()
                              .isBookmarked(
                                  state.surah.number, ayah.numberInSurah),
                          onBookmark: () => context
                              .read<ReadingCubit>()
                              .toggleBookmark(
                                state.surah.number,
                                ayah.numberInSurah,
                                surahName: state.surah.englishName,
                              ),
                          onTafsir: () => context.push(
                            '/tafsir/${state.surah.number}/${ayah.numberInSurah}',
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              floatingActionButton: FloatingActionButton.small(
                onPressed: () => _showJumpToAyahDialog(context, state),
                child: const Icon(Icons.format_list_numbered),
              ),
            );
          }

          return const SizedBox();
        },
      ),
      ),
    );
  }

  void _showReadingSettings(BuildContext context, ReadingLoaded state) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        final audioBloc = context.read<AudioBloc>();
        final audioState = audioBloc.state;
        final currentReciter = audioState is AudioPlayingState
            ? audioState.reciterId
            : RepositoryProvider.of<SettingsRepository>(context).defaultReciter;

        return _ReadingSettingsSheet(
          arabicFontSize: state.arabicFontSize,
          translationFontSize: state.translationFontSize,
          showTranslation: state.showTranslation,
          showTransliteration: state.showTransliteration,
          showBanglaPronunciation: state.showBanglaPronunciation,
          currentReciter: currentReciter,
          onArabicFontSizeChanged: (size) =>
              context.read<ReadingCubit>().setArabicFontSize(size),
          onTranslationFontSizeChanged: (size) =>
              context.read<ReadingCubit>().setTranslationFontSize(size),
          onTranslationToggled: () =>
              context.read<ReadingCubit>().toggleTranslation(),
          onTransliterationToggled: () =>
              context.read<ReadingCubit>().toggleTransliteration(),
          onBanglaPronunciationToggled: () =>
              context.read<ReadingCubit>().toggleBanglaPronunciation(),
          onReciterChanged: (reciter) =>
              audioBloc.add(SetReciterEvent(reciter)),
        );
      },
    );
  }

  void _showJumpToAyahDialog(BuildContext context, ReadingLoaded state) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Jump to Ayah'),
          content: SizedBox(
            width: 200,
            child: TextField(
              autofocus: true,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: '1 - ${state.surah.numberOfAyahs}',
                border: const OutlineInputBorder(),
              ),
              onSubmitted: (value) {
                final ayah = int.tryParse(value);
                if (ayah != null &&
                    ayah >= 1 &&
                    ayah <= state.surah.numberOfAyahs) {
                  context.read<ReadingCubit>().setCurrentAyah(ayah);
                  Navigator.of(context).pop();
                  // Scroll to ayah
                  final offset = (ayah - 1) * 200.0;
                  if (_scrollController.hasClients) {
                    _scrollController.animateTo(
                      offset.clamp(
                          0, _scrollController.position.maxScrollExtent),
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOut,
                    );
                  }
                }
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }
}

// ---- Surah Header ----

class _SurahHeader extends StatelessWidget {
  final Surah surah;

  const _SurahHeader({required this.surah});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasBismillah = SurahUtils.hasBismillah(surah.number);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        children: [
          Text(
            surah.name,
            style: GoogleFonts.amiri(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            surah.englishName,
            style: theme.textTheme.titleLarge,
          ),
          const SizedBox(height: 2),
          Text(
            surah.englishNameTranslation,
            style: theme.textTheme.bodySmall?.copyWith(
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${surah.revelationType.name.toUpperCase()} • ${surah.numberOfAyahs} Ayahs',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),

          // Bismillah
          if (hasBismillah) ...[
            const SizedBox(height: 20),
            Directionality(
              textDirection: TextDirection.rtl,
              child: Text(
                'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                textAlign: TextAlign.center,
                style: GoogleFonts.amiri(
                  fontSize: 24,
                  color: theme.colorScheme.secondary,
                  height: 1.5,
                ),
              ),
            ),
            const Divider(height: 32),
          ],
        ],
      ),
    );
  }
}

// ---- Reading Settings Bottom Sheet ----

class _ReadingSettingsSheet extends StatelessWidget {
  final double arabicFontSize;
  final double translationFontSize;
  final bool showTranslation;
  final bool showTransliteration;
  final bool showBanglaPronunciation;
  final String currentReciter;
  final ValueChanged<double> onArabicFontSizeChanged;
  final ValueChanged<double> onTranslationFontSizeChanged;
  final VoidCallback onTranslationToggled;
  final VoidCallback onTransliterationToggled;
  final VoidCallback onBanglaPronunciationToggled;
  final ValueChanged<String> onReciterChanged;

  const _ReadingSettingsSheet({
    required this.arabicFontSize,
    required this.translationFontSize,
    required this.showTranslation,
    required this.showTransliteration,
    required this.showBanglaPronunciation,
    required this.currentReciter,
    required this.onArabicFontSizeChanged,
    required this.onTranslationFontSizeChanged,
    required this.onTranslationToggled,
    required this.onTransliterationToggled,
    required this.onBanglaPronunciationToggled,
    required this.onReciterChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Reading Settings',
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 20),

          // Arabic Font Size
          Text('Arabic Font Size: ${arabicFontSize.round()}',
              style: theme.textTheme.bodyMedium),
          Slider(
            value: arabicFontSize,
            min: 18,
            max: 48,
            divisions: 15,
            label: '${arabicFontSize.round()}',
            onChanged: onArabicFontSizeChanged,
          ),
          const SizedBox(height: 12),

          // Translation Font Size
          Text('Translation Font Size: ${translationFontSize.round()}',
              style: theme.textTheme.bodyMedium),
          Slider(
            value: translationFontSize,
            min: 12,
            max: 28,
            divisions: 8,
            label: '${translationFontSize.round()}',
            onChanged: onTranslationFontSizeChanged,
          ),
          const SizedBox(height: 16),

          // Toggles
          SwitchListTile(
            title: const Text('Show Translation'),
            value: showTranslation,
            onChanged: (_) => onTranslationToggled(),
            contentPadding: EdgeInsets.zero,
          ),
          SwitchListTile(
            title: const Text('Show Transliteration'),
            value: showTransliteration,
            onChanged: (_) => onTransliterationToggled(),
            contentPadding: EdgeInsets.zero,
          ),
          SwitchListTile(
            title: const Text('Show Bangla Pronunciation'),
            value: showBanglaPronunciation,
            onChanged: (_) => onBanglaPronunciationToggled(),
            contentPadding: EdgeInsets.zero,
          ),

          const SizedBox(height: 16),

          // Reciter selector
          Text('Reciter', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 4),
          DropdownButtonFormField<String>(
            value: currentReciter,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            isExpanded: true,
            items: const [
              DropdownMenuItem(
                value: 'Alafasy_128kbps',
                child: Text('Mishary Rashid Alafasy'),
              ),
              DropdownMenuItem(
                value: 'Ghamadi_128kbps',
                child: Text('Saad Al-Ghamadi'),
              ),
              DropdownMenuItem(
                value: 'Husary_128kbps',
                child: Text('Mahmoud Khalil Al-Husary'),
              ),
              DropdownMenuItem(
                value: 'Abdul_Basit_Murattal_128kbps',
                child: Text('Abdul Basit Abdus Samad'),
              ),
              DropdownMenuItem(
                value: 'Sudais_128kbps',
                child: Text('Abdul Rahman Al-Sudais'),
              ),
            ],
            onChanged: (reciter) {
              if (reciter != null) onReciterChanged(reciter);
            },
          ),

          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

