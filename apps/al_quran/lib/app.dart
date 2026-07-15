import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'config/routes.dart';
import 'config/themes.dart';
import 'core/repositories/settings_repository.dart';
import 'core/repositories/quran_repository.dart';
import 'features/audio_player/bloc/audio_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

class AlQuranApp extends StatelessWidget {
  const AlQuranApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<QuranRepository>(
          create: (_) => QuranRepository(),
        ),
        RepositoryProvider<SettingsRepository>(
          create: (_) => SettingsRepository(Hive.box('settings')),
        ),
        RepositoryProvider<BookmarkRepository>(
          create: (_) => BookmarkRepository(Hive.box('bookmarks')),
        ),
        RepositoryProvider<LastReadRepository>(
          create: (_) => LastReadRepository(Hive.box('lastRead')),
        ),
        RepositoryProvider<SearchHistoryRepository>(
          create: (_) => SearchHistoryRepository(Hive.box('searchHistory')),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AudioBloc>(
            create: (_) => AudioBloc(),
          ),
        ],
        child: const _AppContent(),
      ),
    );
  }
}

class _AppContent extends StatelessWidget {
  const _AppContent();

  @override
  Widget build(BuildContext context) {
    final settingsRepo = RepositoryProvider.of<SettingsRepository>(context);
    final isDarkMode = settingsRepo.isDarkMode;

    return MaterialApp.router(
      title: 'Al Quran',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      routerConfig: AppRouter.router,
    );
  }
}
