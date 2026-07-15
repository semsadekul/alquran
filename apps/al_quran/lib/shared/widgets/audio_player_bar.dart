import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../features/audio_player/bloc/audio_bloc.dart';
import '../../core/utils/audio_utils.dart';

class AudioPlayerBar extends StatelessWidget {
  final int surahNumber;
  final int totalAyahs;

  const AudioPlayerBar({
    super.key,
    required this.surahNumber,
    required this.totalAyahs,
  });

  @override
  Widget build(BuildContext context) {
    return BlocSelector<AudioBloc, AudioState, AudioState>(
      selector: (state) => state,
      builder: (context, state) {
        if (state is AudioIdle) return const SizedBox.shrink();

        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: _AudioBarContent(
              surahNumber: surahNumber,
              totalAyahs: totalAyahs,
              state: state,
            ),
          ),
        );
      },
    );
  }
}

class _AudioBarContent extends StatelessWidget {
  final int surahNumber;
  final int totalAyahs;
  final AudioState state;

  const _AudioBarContent({
    required this.surahNumber,
    required this.totalAyahs,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (state is AudioLoading) {
      return const Padding(
        padding: EdgeInsets.all(12),
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }

    final currentIndex = state.ayahIndexOrZero;
    final isPlaying = state.isPlaying;
    final isPaused = state.isPaused;
    final localState = state;
    final playingState = localState is AudioPlayingState ? localState : null;
    final progress = playingState?.position ?? Duration.zero;
    final duration = playingState?.duration ?? Duration.zero;
    final speed = playingState?.speed ?? 1.0;
    final repeatMode = playingState?.repeatMode ?? AudioRepeatMode.none;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Thin progress bar
        LinearProgressIndicator(
          value: duration.inMilliseconds > 0
              ? progress.inMilliseconds / duration.inMilliseconds
              : 0,
          minHeight: 2,
          backgroundColor: theme.dividerColor,
        ),

        // Main controls
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            children: [
              // Ayah info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Ayah ${currentIndex + 1} / $totalAyahs',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      AudioUtils.formatDuration(progress),
                      style: TextStyle(
                        fontSize: 11,
                        color: theme.colorScheme.onSurface
                            .withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),

              // Skip previous
              IconButton(
                icon: const Icon(Icons.skip_previous),
                iconSize: 22,
                onPressed: currentIndex > 0
                    ? () => context.read<AudioBloc>().add(
                          const PreviousAyahEvent(),
                        )
                    : null,
                visualDensity: VisualDensity.compact,
              ),

              // Play / Pause
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.colorScheme.primary,
                ),
                child: IconButton(
                  icon: Icon(
                    isPlaying
                        ? Icons.pause
                        : Icons.play_arrow,
                    color: Colors.white,
                  ),
                  iconSize: 24,
                  onPressed: () {
                    if (isPlaying) {
                      context.read<AudioBloc>().add(const PauseEvent());
                    } else if (isPaused || state is AudioCompletedState) {
                      context.read<AudioBloc>().add(const ResumeEvent());
                    }
                  },
                ),
              ),

              // Skip next
              IconButton(
                icon: const Icon(Icons.skip_next),
                iconSize: 22,
                onPressed: currentIndex < totalAyahs - 1
                    ? () => context.read<AudioBloc>().add(
                          const NextAyahEvent(),
                        )
                    : null,
                visualDensity: VisualDensity.compact,
              ),

              // Speed control
              _SpeedButton(speed: speed),

              // Repeat mode
              _RepeatButton(repeatMode: repeatMode),

              // Close
              IconButton(
                icon: const Icon(Icons.close, size: 18),
                onPressed: () =>
                    context.read<AudioBloc>().add(const StopEvent()),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SpeedButton extends StatelessWidget {
  final double speed;

  const _SpeedButton({required this.speed});

  @override
  Widget build(BuildContext context) {
    final speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    final currentIndex = speeds.indexOf(speed);
    final nextSpeed = speeds[(currentIndex + 1) % speeds.length];

    return IconButton(
      icon: Text(
        '${speed}x',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: speed != 1.0
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
        ),
      ),
      onPressed: () =>
          context.read<AudioBloc>().add(SetSpeedEvent(nextSpeed)),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _RepeatButton extends StatelessWidget {
  final AudioRepeatMode repeatMode;

  const _RepeatButton({required this.repeatMode});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    IconData icon;
    Color? color;
    String tooltip;

    switch (repeatMode) {
      case AudioRepeatMode.none:
        icon = Icons.repeat;
        color = theme.colorScheme.onSurface.withValues(alpha: 0.5);
        tooltip = 'No repeat';
      case AudioRepeatMode.repeatAyah:
        icon = Icons.repeat_one;
        color = theme.colorScheme.primary;
        tooltip = 'Repeat ayah';
      case AudioRepeatMode.repeatSurah:
        icon = Icons.repeat;
        color = theme.colorScheme.primary;
        tooltip = 'Repeat surah';
    }

    return IconButton(
      icon: Icon(icon, color: color, size: 20),
      tooltip: tooltip,
      onPressed: () {
        final next = switch (repeatMode) {
          AudioRepeatMode.none => AudioRepeatMode.repeatAyah,
          AudioRepeatMode.repeatAyah => AudioRepeatMode.repeatSurah,
          AudioRepeatMode.repeatSurah => AudioRepeatMode.none,
        };
        context.read<AudioBloc>().add(SetRepeatModeEvent(next));
      },
      visualDensity: VisualDensity.compact,
    );
  }
}
