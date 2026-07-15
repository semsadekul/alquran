import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/repositories/settings_repository.dart';

// ---- BLoC ----

class OnboardingCubit extends Cubit<OnboardingState> {
  final SettingsRepository _settingsRepo;

  OnboardingCubit(this._settingsRepo) : super(OnboardingState());

  void setPage(int page) => emit(state.copyWith(currentPage: page));

  void setLanguage(String lang) =>
      emit(state.copyWith(language: lang));

  void setTranslation(String translation) =>
      emit(state.copyWith(translation: translation));

  void setTheme(bool isDark) =>
      emit(state.copyWith(isDarkMode: isDark));

  void setReciter(String reciter) =>
      emit(state.copyWith(defaultReciter: reciter));

  void complete() {
    // Save all preferences
    _settingsRepo.isDarkMode = state.isDarkMode;
    _settingsRepo.translationLanguage = state.translation;
    _settingsRepo.defaultReciter = state.defaultReciter;
    _settingsRepo.onboardingComplete = true;
  }

  void skip() {
    _settingsRepo.onboardingComplete = true;
  }
}

class OnboardingState {
  final int currentPage;
  final String language;
  final String translation;
  final bool isDarkMode;
  final String defaultReciter;

  OnboardingState({
    this.currentPage = 0,
    this.language = 'en',
    this.translation = 'bn.bengali',
    this.isDarkMode = false,
    this.defaultReciter = 'Alafasy_128kbps',
  });

  OnboardingState copyWith({
    int? currentPage,
    String? language,
    String? translation,
    bool? isDarkMode,
    String? defaultReciter,
  }) {
    return OnboardingState(
      currentPage: currentPage ?? this.currentPage,
      language: language ?? this.language,
      translation: translation ?? this.translation,
      isDarkMode: isDarkMode ?? this.isDarkMode,
      defaultReciter: defaultReciter ?? this.defaultReciter,
    );
  }
}

// ---- Screen ----

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => OnboardingCubit(
        RepositoryProvider.of<SettingsRepository>(context),
      ),
      child: BlocConsumer<OnboardingCubit, OnboardingState>(
        listener: (context, state) {
          if (state.currentPage == 5) {
            context.read<OnboardingCubit>().complete();
            context.go('/');
          }
        },
        builder: (context, state) {
          return Scaffold(
            body: SafeArea(
              child: Column(
                children: [
                  // Skip button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (state.currentPage < 4)
                        TextButton(
                          onPressed: () {
                            context.read<OnboardingCubit>().skip();
                            context.go('/');
                          },
                          child: const Text('Skip'),
                        ),
                    ],
                  ),

                  // Pages
                  Expanded(
                    child: PageView(
                      controller: _pageController,
                      onPageChanged: (page) => context
                          .read<OnboardingCubit>()
                          .setPage(page),
                      children: [
                        _WelcomePage(theme: Theme.of(context)),
                        _LanguagePage(theme: Theme.of(context)),
                        _TranslationPage(theme: Theme.of(context)),
                        _ThemePage(theme: Theme.of(context)),
                        _ReciterPage(theme: Theme.of(context)),
                      ],
                    ),
                  ),

                  // Bottom buttons
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Back button
                        if (state.currentPage > 0)
                          TextButton(
                            onPressed: () {
                              _pageController.previousPage(
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeOut,
                              );
                            },
                            child: const Text('Back'),
                          )
                        else
                          const SizedBox(),

                        // Next/Get Started button
                        ElevatedButton(
                          onPressed: () {
                            if (state.currentPage < 4) {
                              _pageController.nextPage(
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeOut,
                              );
                            } else {
                              context.read<OnboardingCubit>().complete();
                              context.go('/');
                            }
                          },
                          child: Text(state.currentPage < 4
                              ? 'Next'
                              : 'Get Started'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ---- Pages ----

class _WelcomePage extends StatelessWidget {
  final ThemeData theme;

  const _WelcomePage({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.auto_stories,
            size: 80,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(height: 24),
          Text(
            'Welcome to Al Quran',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Read, listen, and reflect upon the Holy Quran\nwith translations, tafsir, and audio.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }
}

class _LanguagePage extends StatelessWidget {
  final ThemeData theme;

  const _LanguagePage({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Choose Language',
              style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          _OptionCard(
            icon: Icons.language,
            title: 'English',
            isSelected: true,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          _OptionCard(
            icon: Icons.language,
            title: 'বাংলা (Bangla)',
            isSelected: false,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _TranslationPage extends StatelessWidget {
  final ThemeData theme;

  const _TranslationPage({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Choose Translation',
              style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          _OptionCard(
            icon: Icons.translate,
            title: 'Bengali - মুজিবুর রহমান',
            subtitle: 'Bangla translation',
            isSelected: true,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          _OptionCard(
            icon: Icons.translate,
            title: 'Sahih International',
            subtitle: 'English translation',
            isSelected: false,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _ThemePage extends StatelessWidget {
  final ThemeData theme;

  const _ThemePage({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Choose Theme', style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          _OptionCard(
            icon: Icons.light_mode,
            title: 'Light Theme',
            isSelected: true,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          _OptionCard(
            icon: Icons.dark_mode,
            title: 'Dark Theme',
            isSelected: false,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _ReciterPage extends StatelessWidget {
  final ThemeData theme;

  const _ReciterPage({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Choose Reciter',
              style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          _OptionCard(
            icon: Icons.headphones,
            title: 'Mishary Rashid Alafasy',
            isSelected: true,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          _OptionCard(
            icon: Icons.headphones,
            title: 'Saad Al-Ghamadi',
            isSelected: false,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          _OptionCard(
            icon: Icons.headphones,
            title: 'Mahmoud Khalil Al-Husary',
            isSelected: false,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _OptionCard({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? theme.colorScheme.primary.withValues(alpha: 0.1)
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? theme.colorScheme.primary
                : theme.dividerColor,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.bodyLarge),
                if (subtitle != null)
                  Text(subtitle!, style: theme.textTheme.bodySmall),
              ],
            ),
            const Spacer(),
            if (isSelected)
              Icon(Icons.check_circle, color: theme.colorScheme.primary),
          ],
        ),
      ),
    );
  }
}
