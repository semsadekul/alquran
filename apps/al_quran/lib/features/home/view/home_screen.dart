import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/repositories/settings_repository.dart';
import '../../../core/models/reading_position.dart';
import '../../../shared/widgets/loading_shimmer.dart';

// ---- BLoC ----

class HomeCubit extends Cubit<HomeState> {
  final LastReadRepository _lastReadRepo;

  HomeCubit(this._lastReadRepo) : super(HomeInitial());

  void loadHome() {
    emit(HomeLoading());
    try {
18	      final lastRead = _lastReadRepo.getLastReadPosition();
19	      // Placeholder: Fetch or compute daily ayah here
20	      final dailyAyah = Ayah(
21	        number: 1,
22	        surahNumber: 1,
23	        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
24	        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds.',
25	      );
26	      DailyAyahWidgetProvider.update(context, dailyAyah);
      emit(HomeLoaded(lastRead: lastRead));
    } catch (e) {
      emit(HomeError(e.toString()));
    }
  }

  void clearLastRead() {
    _lastReadRepo.clearLastReadPosition();
    loadHome();
  }
}

// ---- States ----

abstract class HomeState {}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final ReadingPosition? lastRead;
  HomeLoaded({this.lastRead});
}

class HomeError extends HomeState {
  final String message;
  HomeError(this.message);
}

// ---- Screen ----

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final lastReadRepo = RepositoryProvider.of<LastReadRepository>(context);
        return HomeCubit(lastReadRepo)..loadHome();
      },
      child: const _HomeView(),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Al Quran'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: BlocBuilder<HomeCubit, HomeState>(
        builder: (context, state) {
          if (state is HomeLoading) {
            return const LoadingShimmer(itemCount: 4);
          }

          if (state is HomeError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline,
                      size: 48,
                      color: theme.colorScheme.error),
                  const SizedBox(height: 16),
                  Text(
                    'Something went wrong',
                    style: theme.textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () =>
                        context.read<HomeCubit>().loadHome(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final lastRead = (state as HomeLoaded?)?.lastRead;

          return RefreshIndicator(
            onRefresh: () async =>
                context.read<HomeCubit>().loadHome(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Greeting
                Text(
                  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontSize: 22,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'In the name of Allah, the Most Gracious, the Most Merciful',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),

                // Continue Reading Card
                if (lastRead != null) _ContinueReadingCard(
                  surahName: lastRead.surahName,
                  ayahNumber: lastRead.ayahNumber,
                  onTap: () => context.push('/surah/${lastRead.surahNumber}?ayah=${lastRead.ayahNumber}'),
                  onDismiss: () => context.read<HomeCubit>().clearLastRead(),
                ),

                const SizedBox(height: 16),

                // Quick Access Grid
                _QuickAccessGrid(theme: theme),

                const SizedBox(height: 24),

                // Daily Ayah Card
                _DailyAyahCard(theme: theme),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ContinueReadingCard extends StatelessWidget {
  final String surahName;
  final int ayahNumber;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const _ContinueReadingCard({
    required this.surahName,
    required this.ayahNumber,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.play_circle_fill,
                  color: theme.colorScheme.primary,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Continue Reading',
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$surahName • Ayah $ayahNumber',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 18),
                onPressed: onDismiss,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAccessGrid extends StatelessWidget {
  final ThemeData theme;

  const _QuickAccessGrid({required this.theme});

  @override
  Widget build(BuildContext context) {
    final items = [
      _QuickAccessItem(
        icon: Icons.menu_book,
        label: 'Surah Index',
        color: const Color(0xFF1B5E20),
        onTap: () => context.push('/surahs'),
      ),
      _QuickAccessItem(
        icon: Icons.layers,
        label: 'Juz Index',
        color: const Color(0xFF2E7D32),
        onTap: () => context.push('/juz'),
      ),
      _QuickAccessItem(
        icon: Icons.bookmark,
        label: 'Bookmarks',
        color: const Color(0xFFD4A574),
        onTap: () => context.push('/bookmarks'),
      ),
      _QuickAccessItem(
        icon: Icons.search,
        label: 'Search',
        color: const Color(0xFF5C5C5C),
        onTap: () => context.push('/search'),
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) => items[index],
    );
  }
}

class _QuickAccessItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAccessItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(
                label,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DailyAyahCard extends StatelessWidget {
  final ThemeData theme;

  const _DailyAyahCard({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Icon(
                  Icons.auto_awesome,
                  color: theme.colorScheme.secondary,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Ayah of the Day',
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Directionality(
              textDirection: TextDirection.rtl,
              child: Text(
                'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineLarge?.copyWith(
                  fontSize: 24,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Indeed, with hardship comes ease.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '— Surah Ash-Sharh (94:6)',
              style: theme.textTheme.bodySmall?.copyWith(
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
