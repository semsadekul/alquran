import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/home/view/home_screen.dart';
import '../features/surah_list/view/surah_list_screen.dart';
import '../features/reading/view/reading_screen.dart';
import '../features/settings/view/settings_screen.dart';
import '../features/bookmarks/view/bookmarks_screen.dart';
import '../features/search/view/search_screen.dart';
import '../features/tafsir/view/tafsir_screen.dart';
import '../features/onboarding/view/onboarding_screen.dart';

class AppRouter {
  AppRouter._();

  static final GlobalKey<NavigatorState> _rootNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'root');

  /// Slide + Fade page transition builder
  static Widget _slideFadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    const begin = Offset(0.15, 0.0);
    const end = Offset.zero;
    const curve = Curves.easeOutCubic;

    final slideAnimation = Tween<Offset>(begin: begin, end: end).animate(
      CurvedAnimation(parent: animation, curve: curve),
    );
    final fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: animation, curve: curve),
    );

    return SlideTransition(
      position: slideAnimation,
      child: FadeTransition(
        opacity: fadeAnimation,
        child: child,
      ),
    );
  }

  /// Bottom-to-top slide transition (for modals/push-like routes)
  static Widget _bottomSlideTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    const begin = Offset(0.0, 0.08);
    const end = Offset.zero;
    final slideAnimation = Tween<Offset>(begin: begin, end: end).animate(
      CurvedAnimation(parent: animation, curve: Curves.easeOut),
    );

    return SlideTransition(
      position: slideAnimation,
      child: child,
    );
  }

  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const HomeScreen(),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const OnboardingScreen(),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/surahs',
        name: 'surahs',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SurahListScreen(),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/surah/:id',
        name: 'surah-reading',
        pageBuilder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          final ayah =
              int.tryParse(state.uri.queryParameters['ayah'] ?? '');
          return CustomTransitionPage(
            key: state.pageKey,
            child:
                ReadingScreen(surahNumber: id, initialAyah: ayah),
            transitionsBuilder: _bottomSlideTransition,
            transitionDuration: const Duration(milliseconds: 350),
          );
        },
      ),
      GoRoute(
        path: '/juz',
        name: 'juz',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SurahListScreen(initialFilter: 'juz'),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/juz/:id',
        name: 'juz-reading',
        pageBuilder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return CustomTransitionPage(
            key: state.pageKey,
            child: ReadingScreen(surahNumber: id, juzNumber: id),
            transitionsBuilder: _bottomSlideTransition,
            transitionDuration: const Duration(milliseconds: 350),
          );
        },
      ),
      GoRoute(
        path: '/bookmarks',
        name: 'bookmarks',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const BookmarksScreen(),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/search',
        name: 'search',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SearchScreen(),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SettingsScreen(),
          transitionsBuilder: _slideFadeTransition,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
      GoRoute(
        path: '/tafsir/:surahId/:ayahId',
        name: 'tafsir',
        pageBuilder: (context, state) {
          final surahId =
              int.parse(state.pathParameters['surahId']!);
          final ayahId =
              int.parse(state.pathParameters['ayahId']!);
          return CustomTransitionPage(
            key: state.pageKey,
            child: TafsirScreen(
                surahNumber: surahId, ayahNumber: ayahId),
            transitionsBuilder: _bottomSlideTransition,
            transitionDuration: const Duration(milliseconds: 300),
          );
        },
      ),
    ],
  );
}
