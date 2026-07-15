import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/repositories/settings_repository.dart';

// ---- BLoC ----

class SettingsCubit extends Cubit<SettingsState> {
  final SettingsRepository _settingsRepo;
  final LastReadRepository _lastReadRepo;
  final BookmarkRepository _bookmarkRepo;

  SettingsCubit({
    required SettingsRepository settingsRepo,
    required LastReadRepository lastReadRepo,
    required BookmarkRepository bookmarkRepo,
  })  : _settingsRepo = settingsRepo,
        _lastReadRepo = lastReadRepo,
        _bookmarkRepo = bookmarkRepo,
        super(SettingsInitial());

  void loadSettings() {
    emit(SettingsLoaded(
      isDarkMode: _settingsRepo.isDarkMode,
      arabicFontSize: _settingsRepo.arabicFontSize,
      translationFontSize: _settingsRepo.translationFontSize,
      showTransliteration: _settingsRepo.showTransliteration,
      showBanglaPronunciation: _settingsRepo.showBanglaPronunciation,
      defaultReciter: _settingsRepo.defaultReciter,
      playbackSpeed: _settingsRepo.playbackSpeed,
      autoPlayNextSurah: _settingsRepo.autoPlayNextSurah,
      dailyReminderEnabled: _settingsRepo.dailyReminderEnabled,
      translationLanguage: _settingsRepo.translationLanguage,
    ));
  }

  void toggleTheme() {
    _settingsRepo.isDarkMode = !_settingsRepo.isDarkMode;
    loadSettings();
  }

  void setArabicFontSize(double size) {
    _settingsRepo.arabicFontSize = size;
    loadSettings();
  }

  void setTranslationFontSize(double size) {
    _settingsRepo.translationFontSize = size;
    loadSettings();
  }

  void toggleTransliteration() {
    _settingsRepo.showTransliteration =
        !_settingsRepo.showTransliteration;
    loadSettings();
  }

  void toggleBanglaPronunciation() {
    _settingsRepo.showBanglaPronunciation =
        !_settingsRepo.showBanglaPronunciation;
    loadSettings();
  }

  void setDefaultReciter(String reciter) {
    _settingsRepo.defaultReciter = reciter;
    loadSettings();
  }

  void setPlaybackSpeed(double speed) {
    _settingsRepo.playbackSpeed = speed;
    loadSettings();
  }

  void toggleAutoPlayNextSurah() {
    _settingsRepo.autoPlayNextSurah =
        !_settingsRepo.autoPlayNextSurah;
    loadSettings();
  }

  void toggleDailyReminder() {
    _settingsRepo.dailyReminderEnabled =
        !_settingsRepo.dailyReminderEnabled;
    loadSettings();
  }

  void setTranslationLanguage(String lang) {
    _settingsRepo.translationLanguage = lang;
    loadSettings();
  }

  void clearAllData() {
    _bookmarkRepo.getAllBookmarks().forEach((b) {
      _bookmarkRepo.removeBookmark(b.id);
    });
    _lastReadRepo.clearLastReadPosition();
    _settingsRepo.clear();
    loadSettings();
  }
}

// ---- States ----

abstract class SettingsState {}

class SettingsInitial extends SettingsState {}

class SettingsLoaded extends SettingsState {
  final bool isDarkMode;
  final double arabicFontSize;
  final double translationFontSize;
  final bool showTransliteration;
  final bool showBanglaPronunciation;
  final String defaultReciter;
  final double playbackSpeed;
  final bool autoPlayNextSurah;
  final bool dailyReminderEnabled;
  final String translationLanguage;

  SettingsLoaded({
    required this.isDarkMode,
    required this.arabicFontSize,
    required this.translationFontSize,
    required this.showTransliteration,
    required this.showBanglaPronunciation,
    required this.defaultReciter,
    required this.playbackSpeed,
    required this.autoPlayNextSurah,
    required this.dailyReminderEnabled,
    required this.translationLanguage,
  });
}

// ---- Screen ----

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SettingsCubit(
        settingsRepo:
            RepositoryProvider.of<SettingsRepository>(context),
        lastReadRepo:
            RepositoryProvider.of<LastReadRepository>(context),
        bookmarkRepo:
            RepositoryProvider.of<BookmarkRepository>(context),
      )..loadSettings(),
      child: const _SettingsView(),
    );
  }
}

class _SettingsView extends StatelessWidget {
  const _SettingsView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: BlocBuilder<SettingsCubit, SettingsState>(
        builder: (context, state) {
          if (state is! SettingsLoaded) {
            return const Center(child: CircularProgressIndicator());
          }

          return ListView(
            padding: const EdgeInsets.only(bottom: 32),
            children: [
              // Appearance Section
              _SectionHeader(title: 'Appearance'),
              SwitchListTile(
                title: const Text('Dark Mode'),
                subtitle: const Text('Toggle dark/light theme'),
                value: state.isDarkMode,
                onChanged: (_) =>
                    context.read<SettingsCubit>().toggleTheme(),
              ),
              ListTile(
                title: const Text('Arabic Font Size'),
                subtitle: Text('${state.arabicFontSize.round()}pt'),
                trailing: SizedBox(
                  width: 200,
                  child: Slider(
                    value: state.arabicFontSize,
                    min: 18,
                    max: 48,
                    divisions: 15,
                    label: '${state.arabicFontSize.round()}',
                    onChanged: (value) =>
                        context.read<SettingsCubit>().setArabicFontSize(value),
                  ),
                ),
              ),
              ListTile(
                title: const Text('Translation Font Size'),
                subtitle: Text('${state.translationFontSize.round()}pt'),
                trailing: SizedBox(
                  width: 200,
                  child: Slider(
                    value: state.translationFontSize,
                    min: 12,
                    max: 28,
                    divisions: 8,
                    label: '${state.translationFontSize.round()}',
                    onChanged: (value) => context
                        .read<SettingsCubit>()
                        .setTranslationFontSize(value),
                  ),
                ),
              ),
              const Divider(),

              // Reading Section
              _SectionHeader(title: 'Reading'),
              SwitchListTile(
                title: const Text('Show Transliteration'),
                subtitle: const Text('Display English transliteration'),
                value: state.showTransliteration,
                onChanged: (_) =>
                    context.read<SettingsCubit>().toggleTransliteration(),
              ),
              SwitchListTile(
                title: const Text('Show Bangla Pronunciation'),
                subtitle: const Text('Display Bangla phonetic reading'),
                value: state.showBanglaPronunciation,
                onChanged: (_) => context
                    .read<SettingsCubit>()
                    .toggleBanglaPronunciation(),
              ),
              ListTile(
                title: const Text('Translation Language'),
                subtitle: Text(state.translationLanguage),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _showLanguagePicker(context, state),
              ),
              const Divider(),

              // Audio Section
              _SectionHeader(title: 'Audio'),
              ListTile(
                title: const Text('Default Reciter'),
                subtitle: Text(state.defaultReciter),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _showReciterPicker(context, state),
              ),
              ListTile(
                title: const Text('Playback Speed'),
                subtitle: Text('${state.playbackSpeed}x'),
                trailing: SizedBox(
                  width: 200,
                  child: Slider(
                    value: state.playbackSpeed,
                    min: 0.5,
                    max: 2.0,
                    divisions: 6,
                    label: '${state.playbackSpeed}x',
                    onChanged: (value) =>
                        context.read<SettingsCubit>().setPlaybackSpeed(value),
                  ),
                ),
              ),
              SwitchListTile(
                title: const Text('Auto-play Next Surah'),
                subtitle: const Text('Continue to next surah when finished'),
                value: state.autoPlayNextSurah,
                onChanged: (_) =>
                    context.read<SettingsCubit>().toggleAutoPlayNextSurah(),
              ),
              const Divider(),

              // Notifications
              _SectionHeader(title: 'Notifications'),
              SwitchListTile(
                title: const Text('Daily Ayah Reminder'),
                subtitle: const Text('Get a daily notification with an ayah'),
                value: state.dailyReminderEnabled,
                onChanged: (_) =>
                    context.read<SettingsCubit>().toggleDailyReminder(),
              ),
              const Divider(),

              // Storage
              _SectionHeader(title: 'Storage'),
              ListTile(
                title: const Text('Clear All Data'),
                subtitle: const Text(
                    'Remove all bookmarks, history, and settings'),
                trailing: const Icon(Icons.delete_outline, color: Colors.red),
                onTap: () => _showClearDataDialog(context),
              ),
              const Divider(),

              // About
              _SectionHeader(title: 'About'),
              ListTile(
                title: const Text('Version'),
                subtitle: const Text('1.0.0'),
              ),
              ListTile(
                title: const Text('Open Source Licenses'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () =>
                    showLicensePage(
                  context: context,
                  applicationName: 'Al Quran',
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showLanguagePicker(BuildContext context, SettingsLoaded state) {
    final languages = [
      {'code': 'bn.bengali', 'name': 'Bangla - Bengali'},
      {'code': 'en.sahih', 'name': 'English - Sahih International'},
      {'code': 'en.asad', 'name': 'English - Muhammad Asad'},
      {'code': 'en.pickthall', 'name': 'English - Pickthall'},
      {'code': 'en.arberry', 'name': 'English - Arberry'},
    ];

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Translation Language',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            ...languages.map((lang) => RadioListTile<String>(
                  title: Text(lang['name']!),
                  value: lang['code']!,
                  groupValue: state.translationLanguage,
                  onChanged: (value) {
                    if (value != null) {
                      context.read<SettingsCubit>().setTranslationLanguage(value);
                      Navigator.pop(context);
                    }
                  },
                )),
          ],
        ),
      ),
    );
  }

  void _showReciterPicker(BuildContext context, SettingsLoaded state) {
    final reciters = [
      'Alafasy_128kbps',
      'Ghamadi_128kbps',
      'Husary_128kbps',
      'Abdul_Basit_Murattal_128kbps',
      'Sudais_128kbps',
    ];

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Default Reciter',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            ...reciters.map((reciter) => RadioListTile<String>(
                  title: Text(reciter.replaceAll('_128kbps', '')),
                  value: reciter,
                  groupValue: state.defaultReciter,
                  onChanged: (value) {
                    if (value != null) {
                      context
                          .read<SettingsCubit>()
                          .setDefaultReciter(value);
                      Navigator.pop(context);
                    }
                  },
                )),
          ],
        ),
      ),
    );
  }

  void _showClearDataDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Data?'),
        content: const Text(
            'This will remove all your bookmarks, reading history, and settings. This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              context.read<SettingsCubit>().clearAllData();
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.primary,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
