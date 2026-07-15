import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/models/tafsir.dart';
import 'bloc/tafsir_bloc.dart';
import '../../shared/widgets/loading_shimmer.dart';

class TafsirScreen extends StatefulWidget {
  final int surahNumber;
  final int ayahNumber;

  const TafsirScreen({
    super.key,
    required this.surahNumber,
    required this.ayahNumber,
  });

  @override
  State<TafsirScreen> createState() => _TafsirScreenState();
}

class _TafsirScreenState extends State<TafsirScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 1, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => TafsirBloc(
        surahNumber: widget.surahNumber,
        ayahNumber: widget.ayahNumber,
      )..loadTafsirs(),
      child: _TafsirView(
        surahNumber: widget.surahNumber,
        ayahNumber: widget.ayahNumber,
        tabController: _tabController,
      ),
    );
  }
}

class _TafsirView extends StatelessWidget {
  final int surahNumber;
  final int ayahNumber;
  final TabController tabController;

  const _TafsirView({
    required this.surahNumber,
    required this.ayahNumber,
    required this.tabController,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocBuilder<TafsirBloc, TafsirState>(
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text('Tafsir $surahNumber:$ayahNumber'),
          ),
          body: _buildBody(context, theme, state),
        );
      },
    );
  }

  Widget _buildBody(
      BuildContext context, ThemeData theme, TafsirState state) {
    if (state is TafsirInitial || state is TafsirLoading) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: LoadingShimmer(itemCount: 6),
      );
    }

    if (state is TafsirError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.info_outline,
                  size: 48,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.4)),
              const SizedBox(height: 16),
              Text(
                state.message,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () =>
                    context.read<TafsirBloc>().loadTafsirs(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (state is TafsirLoaded) {
      final tafsirs = state.tafsirs;
      final selectedId = state.selectedTafsirId;
      final content = state.content;
      final isLoadingContent = state.isLoadingContent;

      // Update tab controller length
      if (tabController.length != tafsirs.length) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          tabController.dispose();
          // Rebuild handled via setState above
        });
      }

      return Column(
        children: [
          // Tafsir selector tabs
          Container(
            color: theme.colorScheme.surface,
            child: TabBar(
              controller: tabController,
              isScrollable: true,
              tabs: tafsirs.map((tafsir) {
                final isSelected = tafsir.id == selectedId;
                return Tab(
                  child: Text(
                    tafsir.name,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurface
                              .withValues(alpha: 0.7),
                    ),
                  ),
                );
              }).toList(),
              onTap: (index) {
                if (index < tafsirs.length) {
                  context
                      .read<TafsirBloc>()
                      .selectTafsir(tafsirs[index].id);
                }
              },
              labelColor: theme.colorScheme.primary,
              unselectedLabelColor:
                  theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
          ),

          // Tafsir content
          Expanded(
            child: isLoadingContent
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Ayah reference header
                        if (content.text.isNotEmpty) ...[
                          // Author name
                          if (content.tafsirName != null)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Text(
                                content.tafsirName!,
                                style: theme.textTheme.titleSmall?.copyWith(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),

                          // Tafsir text
                          SelectableText(
                            content.text,
                            style: TextStyle(
                              fontSize: 15,
                              height: 1.7,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ] else
                          Padding(
                            padding: const EdgeInsets.only(top: 32),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(Icons.auto_stories,
                                      size: 48,
                                      color: theme.colorScheme.primary
                                          .withValues(alpha: 0.4)),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Select a tafsir to view its content\nfor Ayah $surahNumber:$ayahNumber',
                                    textAlign: TextAlign.center,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: theme.colorScheme.onSurface
                                          .withValues(alpha: 0.6),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                        const SizedBox(height: 32),

                        // Navigation for adjacent ayahs
                        Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
              if (ayahNumber > 1)
                TextButton.icon(
                  icon: const Icon(Icons.arrow_back, size: 18),
                  label: Text('Ayah ${ayahNumber - 1}'),
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (_) => TafsirScreen(
                          surahNumber: surahNumber,
                          ayahNumber: ayahNumber - 1,
                        ),
                      ),
                    );
                  },
                ),
              const SizedBox(width: 24),
              TextButton.icon(
                icon: const Icon(Icons.arrow_forward, size: 18),
                label: Text('Ayah ${ayahNumber + 1}'),
                onPressed: () {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (_) => TafsirScreen(
                        surahNumber: surahNumber,
                        ayahNumber: ayahNumber + 1,
                      ),
                    ),
                  );
                },
              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      );
    }

    return const SizedBox();
  }
}

/// Extension to access ayahNumber from widget in state
extension _WidgetX on _TafsirView {
  int get ayahNumber => this.ayahNumber;
}
