import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_service/audio_service.dart';
import '../../../core/utils/audio_utils.dart';

// ---- Audio Service Handler ----

class QuranAudioHandler extends BaseAudioHandler {
  final AudioPlayer _player = AudioPlayer();

  QuranAudioHandler() {
    _player.positionStream.listen((position) {
      playbackState.add(playbackState.value.copyWith(
        playing: _player.playing,
      ));
    });
  }

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  @override
  Future<void> stop() async {
    await _player.stop();
  }

  @override
  Future<void> setSpeed(double speed) => _player.setSpeed(speed);

  AudioPlayer get player => _player;
}

// ---- BLoC Events ----

sealed class AudioEvent {
  const AudioEvent();
}

class PlaySurahEvent extends AudioEvent {
  final int surahNumber;
  final List<String> ayahUrls;
  final int? startAyahIndex;
  const PlaySurahEvent({
    required this.surahNumber,
    required this.ayahUrls,
    this.startAyahIndex,
  });
}

class PauseEvent extends AudioEvent {
  const PauseEvent();
}

class ResumeEvent extends AudioEvent {
  const ResumeEvent();
}

class StopEvent extends AudioEvent {
  const StopEvent();
}

class NextAyahEvent extends AudioEvent {
  const NextAyahEvent();
}

class PreviousAyahEvent extends AudioEvent {
  const PreviousAyahEvent();
}

class SeekToAyahEvent extends AudioEvent {
  final int ayahIndex;
  const SeekToAyahEvent(this.ayahIndex);
}

class SetSpeedEvent extends AudioEvent {
  final double speed;
  const SetSpeedEvent(this.speed);
}

class SetReciterEvent extends AudioEvent {
  final String reciterId;
  const SetReciterEvent(this.reciterId);
}

class SetRepeatModeEvent extends AudioEvent {
  final AudioRepeatMode repeatMode;
  const SetRepeatModeEvent(this.repeatMode);
}

class AudioProgressEvent extends AudioEvent {
  final Duration position;
  final Duration duration;
  const AudioProgressEvent({required this.position, required this.duration});
}

class AudioPlayerInitializedEvent extends AudioEvent {
  final AudioPlayer player;
  const AudioPlayerInitializedEvent(this.player);
}

// ---- BLoC State ----

enum AudioRepeatMode { none, repeatAyah, repeatSurah }

sealed class AudioState {
  const AudioState();
}

class AudioIdle extends AudioState {
  const AudioIdle();
}

class AudioLoading extends AudioState {
  final int surahNumber;
  final int ayahIndex;
  const AudioLoading({required this.surahNumber, this.ayahIndex = 0});
}

class AudioPlayingState extends AudioState {
  final int surahNumber;
  final int ayahIndex;
  final int totalAyahs;
  final Duration position;
  final Duration duration;
  final double speed;
  final String reciterId;
  final AudioRepeatMode repeatMode;

  const AudioPlayingState({
    required this.surahNumber,
    required this.ayahIndex,
    required this.totalAyahs,
    required this.position,
    required this.duration,
    this.speed = 1.0,
    this.reciterId = 'Alafasy_128kbps',
    this.repeatMode = AudioRepeatMode.none,
  });

  AudioPlayingState copyWith({
    int? ayahIndex,
    Duration? position,
    Duration? duration,
    double? speed,
    String? reciterId,
    AudioRepeatMode? repeatMode,
  }) {
    return AudioPlayingState(
      surahNumber: surahNumber,
      ayahIndex: ayahIndex ?? this.ayahIndex,
      totalAyahs: totalAyahs,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      speed: speed ?? this.speed,
      reciterId: reciterId ?? this.reciterId,
      repeatMode: repeatMode ?? this.repeatMode,
    );
  }
}

class AudioPausedState extends AudioState {
  final int surahNumber;
  final int ayahIndex;
  final Duration position;

  const AudioPausedState({
    required this.surahNumber,
    required this.ayahIndex,
    required this.position,
  });
}

class AudioCompletedState extends AudioState {
  final int surahNumber;
  const AudioCompletedState({required this.surahNumber});
}

class AudioErrorState extends AudioState {
  final String message;
  const AudioErrorState({required this.message});
}

// ---- BLoC ----

class AudioBloc extends Bloc<AudioEvent, AudioState> {
  AudioPlayer? _player;
  List<String> _ayahUrls = [];
  int _totalAyahs = 0;
  int _currentSurahNumber = 0;
  double _speed = 1.0;
  String _reciterId = 'Alafasy_128kbps';
  AudioRepeatMode _repeatMode = AudioRepeatMode.none;

  StreamSubscription? _positionSubscription;
  StreamSubscription? _playerStateSubscription;
  StreamSubscription? _sequenceSubscription;

  /// Whether the audio service is connected
  static bool audioServiceAvailable = false;

  AudioBloc() : super(const AudioIdle()) {
    on<PlaySurahEvent>(_onPlaySurah);
    on<PauseEvent>(_onPause);
    on<ResumeEvent>(_onResume);
    on<StopEvent>(_onStop);
    on<NextAyahEvent>(_onNextAyah);
    on<PreviousAyahEvent>(_onPreviousAyah);
    on<SeekToAyahEvent>(_onSeekToAyah);
    on<SetSpeedEvent>(_onSetSpeed);
    on<SetReciterEvent>(_onSetReciter);
    on<SetRepeatModeEvent>(_onSetRepeatMode);
  }

  Future<void> _initPlayer() async {
    if (_player != null) return;
    _player = AudioPlayer();
    _player!.setSpeed(_speed);

    // Listen for position updates
    _positionSubscription = _player!.positionStream.listen((position) {
      final duration = _player!.duration ?? Duration.zero;
      if (state is AudioPlayingState) {
        final current = state as AudioPlayingState;
        emit(current.copyWith(position: position, duration: duration));
      }
    });

    // Listen for player state changes
    _playerStateSubscription = _player!.playerStateStream.listen((playerState) {
      if (playerState.processingState == ProcessingState.completed) {
        _onAyahComplete();
      } else if (playerState.processingState == ProcessingState.ready &&
          playerState.playing == false &&
          state is AudioLoading) {
        // Started playing
        final loadingState = state as AudioLoading;
        emit(AudioPlayingState(
          surahNumber: loadingState.surahNumber,
          ayahIndex: loadingState.ayahIndex,
          totalAyahs: _totalAyahs,
          position: Duration.zero,
          duration: _player!.duration ?? Duration.zero,
          speed: _speed,
          reciterId: _reciterId,
          repeatMode: _repeatMode,
        ));
      }
    });
  }

  Future<void> _onPlaySurah(PlaySurahEvent event, Emitter<AudioState> emit) async {
    try {
      await _initPlayer();
      _ayahUrls = event.ayahUrls;
      _totalAyahs = event.ayahUrls.length;
      _currentSurahNumber = event.surahNumber;

      final startIndex = event.startAyahIndex ?? 0;

      emit(AudioLoading(surahNumber: event.surahNumber, ayahIndex: startIndex));

      // Create audio sources for all ayahs
      final sources = _ayahUrls.map((url) => AudioSource.uri(Uri.parse(url))).toList();

      if (sources.isEmpty) {
        emit(const AudioErrorState(message: 'No audio sources available'));
        return;
      }

      await _player!.setAudioSource(
        ConcatenatingAudioSource(children: sources),
        initialIndex: startIndex,
      );

      await _player!.play();
    } catch (e) {
      emit(AudioErrorState(message: 'Failed to play audio: $e'));
    }
  }

  void _onPause(PauseEvent event, Emitter<AudioState> emit) {
    _player?.pause();
    if (state is AudioPlayingState) {
      final s = state as AudioPlayingState;
      emit(AudioPausedState(
        surahNumber: s.surahNumber,
        ayahIndex: s.ayahIndex,
        position: s.position,
      ));
    }
  }

  void _onResume(ResumeEvent event, Emitter<AudioState> emit) {
    _player?.play();
    if (state is AudioPausedState) {
      final s = state as AudioPausedState;
      emit(AudioPlayingState(
        surahNumber: s.surahNumber,
        ayahIndex: s.ayahIndex,
        totalAyahs: _totalAyahs,
        position: s.position,
        duration: _player?.duration ?? Duration.zero,
        speed: _speed,
        reciterId: _reciterId,
        repeatMode: _repeatMode,
      ));
    }
  }

  void _onStop(StopEvent event, Emitter<AudioState> emit) {
    _player?.stop();
    _player?.stop();
    emit(const AudioIdle());
  }

  void _onNextAyah(NextAyahEvent event, Emitter<AudioState> emit) {
    if (_player == null) return;
    final currentIndex = _player!.currentIndex ?? 0;
    if (currentIndex < _totalAyahs - 1) {
      _player!.seek(Duration.zero, index: currentIndex + 1);
    } else if (_repeatMode == AudioRepeatMode.repeatSurah) {
      _player!.seek(Duration.zero, index: 0);
    }
  }

  void _onPreviousAyah(PreviousAyahEvent event, Emitter<AudioState> emit) {
    if (_player == null) return;
    final currentIndex = _player!.currentIndex ?? 0;
    if (currentIndex > 0) {
      _player!.seek(Duration.zero, index: currentIndex - 1);
    }
  }

  void _onSeekToAyah(SeekToAyahEvent event, Emitter<AudioState> emit) {
    if (_player == null) return;
    if (event.ayahIndex >= 0 && event.ayahIndex < _totalAyahs) {
      _player!.seek(Duration.zero, index: event.ayahIndex);
    }
  }

  void _onSetSpeed(SetSpeedEvent event, Emitter<AudioState> emit) {
    _speed = event.speed;
    _player?.setSpeed(_speed);
    if (state is AudioPlayingState) {
      final s = state as AudioPlayingState;
      emit(s.copyWith(speed: _speed));
    }
  }

  void _onSetReciter(SetReciterEvent event, Emitter<AudioState> emit) {
    _reciterId = event.reciterId;
    // Need to restart with new reciter if playing
    if (state is AudioPlayingState || state is AudioPausedState) {
      final currentIndex = _player?.currentIndex ?? 0;
      if (_currentSurahNumber > 0) {
        add(PlaySurahEvent(
          surahNumber: _currentSurahNumber,
          ayahUrls: AudioUtils.getSurahAudioUrls(
            surahNumber: _currentSurahNumber,
            totalAyahs: _totalAyahs,
            reciterId: _reciterId,
          ),
          startAyahIndex: currentIndex,
        ));
      }
    }
  }

  void _onSetRepeatMode(SetRepeatModeEvent event, Emitter<AudioState> emit) {
    _repeatMode = event.repeatMode;
    if (state is AudioPlayingState) {
      final s = state as AudioPlayingState;
      emit(s.copyWith(repeatMode: _repeatMode));
    }
  }

  void _onAyahComplete() {
    if (_repeatMode == AudioRepeatMode.repeatAyah && _player != null) {
      final currentIndex = _player!.currentIndex ?? 0;
      _player!.seek(Duration.zero, index: currentIndex);
      _player!.play();
      return;
    }

    final currentIndex = _player?.currentIndex ?? 0;
    if (currentIndex >= _totalAyahs - 1) {
      if (_repeatMode == AudioRepeatMode.repeatSurah) {
        _player?.seek(Duration.zero, index: 0);
        _player?.play();
      } else {
        emit(AudioCompletedState(surahNumber: _currentSurahNumber));
      }
    }
  }

  /// Get the current ayah index being played
  int get currentAyahIndex {
    if (state is AudioPlayingState) return (state as AudioPlayingState).ayahIndex;
    return _player?.currentIndex ?? 0;
  }

  @override
  Future<void> close() {
    _positionSubscription?.cancel();
    _playerStateSubscription?.cancel();
    _sequenceSubscription?.cancel();
    _player?.dispose();
    return super.close();
  }
}

/// Extension to extract ayah index from AudioPlayingState
extension AudioStateX on AudioState {
  int get ayahIndexOrZero {
    if (this is AudioPlayingState) return (this as AudioPlayingState).ayahIndex;
    if (this is AudioLoading) return (this as AudioLoading).ayahIndex;
    return 0;
  }

  bool get isPlaying => this is AudioPlayingState;
  bool get isPaused => this is AudioPausedState;
  bool get isLoading => this is AudioLoading;
  bool get isIdle => this is AudioIdle;
}
