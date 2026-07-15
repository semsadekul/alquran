import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/surah.dart';
import '../../../core/repositories/quran_repository.dart';
import '../../../shared/widgets/surah_tile.dart';
import '../../../shared/widgets/loading_shimmer.dart';

// ---- BLoC ----

class SurahListCubit extends Cubit<SurahListState> {
  final QuranRepository _quranRepo;
  List<Surah>? _allSurahs;
  String _searchQuery = '';
  RevelationType? _filterType;
  SortMode _sortMode = SortMode.defaultOrder;

  SurahListCubit(this._quranRepo) : super(SurahListInitial());

  Future<void> loadSurahs() async {
    emit(SurahListLoading());
    try {
      _allSurahs = await _quranRepo.getSurahs();
      _applyFilters();
    } catch (e) {
      emit(SurahListError(e.toString()));
    }
  }

  void search(String query) {
    _searchQuery = query;
    _applyFilters();
  }

  void filterByType(RevelationType? type) {
    _filterType = _filterType == type ? null : type;
    _applyFilters();
  }

  void sortBy(SortMode mode) {
    _sortMode = mode;
    _applyFilters();
  }

  void _applyFilters() {
    if (_allSurahs == null) return;

    var surahs = List<Surah>.from(_allSurahs!);

    // Apply search
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      surahs = surahs.where((s) {
        return s.englishName.toLowerCase().contains(q) ||
            s.englishNameTranslation.toLowerCase().contains(q) ||
            s.name.contains(q) ||
            s.number.toString() == q;
      }).toList();
    }

    // Apply revelation type filter
    if (_filterType != null) {
      surahs = surahs.where((s) => s.revelationType == _filterType).toList();
    }

    // Apply sort
    switch (_sortMode) {
      case SortMode.defaultOrder:
        surahs.sort((a, b) => a.number.compareTo(b.number));
        break;
      case SortMode.alphabetical:
        surahs.sort((a, b) => a.englishName.compareTo(b.englishName));
        break;
      case SortMode.revelationOrder:
        surahs.sort((a, b) => a.number.compareTo(b.number)); // Simplified
        break;
    }

    emit(SurahListLoaded(
      surahs: surahs,
      totalCount: _allSurahs!.length,
      filterType: _filterType,
      activeFilterCount: _filterType != null ? 1 : 0,
      sortMode: _sortMode,
    ));
  }
}

enum SortMode { defaultOrder, alphabetical, revelationOrder }

// ---- States ----

abstract class SurahListState {}

class SurahListInitial extends SurahListState {}

class SurahListLoading extends SurahListState {}

class SurahListLoaded extends SurahListState {
  final List<Surah> surahs;
  final int totalCount;
  final RevelationType? filterType;
  final int activeFilterCount;
  final SortMode sortMode;

  SurahListLoaded({
    required this.surahs,
    required this.totalCount,
    this.filterType,
    this.activeFilterCount = 0,
    this.sortMode = SortMode.defaultOrder,
  });
}

class SurahListError extends SurahListState {
  final String message;
  SurahListError(this.message);
}

// ---- Screen ----

class SurahListScreen extends StatelessWidget {
  final String? initialFilter;

  const SurahListScreen({super.key, this.initialFilter});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final quranRepo = RepositoryProvider.of<QuranRepository>(context);
        return SurahListCubit(quranRepo)..loadSurahs();
      },
      child: const _SurahListView(),
    );
  }
}

class _SurahListView extends StatefulWidget {
  const _SurahListView();

  @override
  State<_SurahListView> createState() => _SurahListViewState();
}

class _SurahListViewState extends State<_SurahListView> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Surahs'),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search surahs...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          context.read<SurahListCubit>().search('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: theme.colorScheme.surface,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
              ),
              onChanged: (query) {
                setState(() {});
                context.read<SurahListCubit>().search(query);
              },
            ),
          ),

          // Filter Chips
          BlocBuilder<SurahListCubit, SurahListState>(
            builder: (context, state) {
              if (state is! SurahListLoaded) return const SizedBox();
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    _FilterChip(
                      label: 'All',
                      selected: state.filterType == null,
                      onSelected: () =>
                          context.read<SurahListCubit>().filterByType(null),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Makki',
                      selected: state.filterType == RevelationType.meccan,
                      onSelected: () => context
                          .read<SurahListCubit>()
                          .filterByType(RevelationType.meccan),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Madani',
                      selected: state.filterType == RevelationType.medinan,
                      onSelected: () => context
                          .read<SurahListCubit>()
                          .filterByType(RevelationType.medinan),
                    ),
                    const Spacer(),
                    PopupMenuButton<SortMode>(
                      icon: const Icon(Icons.sort, size: 20),
                      onSelected: (mode) =>
                          context.read<SurahListCubit>().sortBy(mode),
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          value: SortMode.defaultOrder,
                          child: Text('Default',
                              style: state is SurahListLoaded &&
                                      state.sortMode == SortMode.defaultOrder
                                  ? TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.primary)
                                  : null),
                        ),
                        PopupMenuItem(
                          value: SortMode.alphabetical,
                          child: Text('Alphabetical',
                              style: state is SurahListLoaded &&
                                      state.sortMode ==
                                          SortMode.alphabetical
                                  ? TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.primary)
                                  : null),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 4),

          // Surah List
          Expanded(
            child: BlocBuilder<SurahListCubit, SurahListState>(
              builder: (context, state) {
                if (state is SurahListLoading) {
                  return const LoadingShimmer(itemCount: 10);
                }

                if (state is SurahListError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline,
                            size: 48,
                            color: theme.colorScheme.error),
                        const SizedBox(height: 16),
                        Text(state.message),
                        TextButton(
                          onPressed: () =>
                              context.read<SurahListCubit>().loadSurahs(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                if (state is SurahListLoaded) {
                  if (state.surahs.isEmpty) {
                    return Center(
                      child: Text(
                        'No surahs found',
                        style: theme.textTheme.bodyLarge,
                      ),
                    );
                  }

                  // Show count
                  if (state.surahs.length != state.totalCount) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      // Could show a snackbar or similar
                    });
                  }

                  return RefreshIndicator(
                    onRefresh: () =>
                        context.read<SurahListCubit>().loadSurahs(),
                    child: ListView.builder(
                      padding: const EdgeInsets.only(bottom: 16),
                      itemCount: state.surahs.length,
                      itemBuilder: (context, index) {
                        final surah = state.surahs[index];
                        return TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0.0, end: 1.0),
                          duration:
                              Duration(milliseconds: 250 + (index * 30)),
                          curve: Curves.easeOut,
                          builder: (context, value, child) {
                            return Opacity(
                              opacity: value,
                              child: Transform.translate(
                                offset: Offset(0, 20 * (1 - value)),
                                child: child,
                              ),
                            );
                          },
                          child: SurahTile(
                            surah: surah,
                            onTap: () =>
                                context.push('/surah/${surah.number}'),
                          ),
                        );
                      },
                    ),
                  );
                }

                return const SizedBox();
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onSelected;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onSelected,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primary.withValues(alpha: 0.15)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : theme.colorScheme.outline,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
            color: selected
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface.withValues(alpha: 0.7),
          ),
        ),
      ),
    );
  }
}
