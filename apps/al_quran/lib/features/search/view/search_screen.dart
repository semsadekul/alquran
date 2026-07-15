import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/surah.dart';
import '../../../core/repositories/quran_repository.dart';
import '../../../core/repositories/settings_repository.dart';
import '../../../shared/widgets/loading_shimmer.dart';

// ---- BLoC ----

class SearchCubit extends Cubit<SearchState> {
  final QuranRepository _quranRepo;
  final SearchHistoryRepository _searchHistoryRepo;
  List<Surah>? _allSurahs;

  SearchCubit(this._quranRepo, this._searchHistoryRepo)
      : super(SearchInitial());

  void loadHistory() {
    final history = _searchHistoryRepo.getRecentSearches();
    emit(SearchHistory(history: history));
  }

  Future<void> search(String query) async {
    if (query.isEmpty) {
      loadHistory();
      return;
    }

    emit(SearchLoading());

    try {
      // Load all surahs for name search
      _allSurahs ??= await _quranRepo.getSurahs();

      // Search surah names
      final surahResults = _quranRepo.searchSurahs(query);

      // Search in loaded ayahs for text match
      final ayahResults = <MapEntry<Surah, List<int>>>[];
      for (final surah in _allSurahs!) {
        try {
          final ayahs = await _quranRepo.getAyahs(surah.number);
          final matching = <int>[];
          for (final ayah in ayahs) {
            final q = query.toLowerCase();
            if ((ayah.bangla?.toLowerCase().contains(q) ?? false) ||
                (ayah.english?.toLowerCase().contains(q) ?? false)) {
              matching.add(ayah.numberInSurah);
            }
            if (matching.length >= 5) break; // Limit per surah
          }
          if (matching.isNotEmpty) {
            ayahResults.add(MapEntry(surah, matching));
          }
        } catch (_) {
          continue;
        }
      }

      // Save to history
      await _searchHistoryRepo.addSearch(query);

      emit(SearchResult(
        query: query,
        surahResults: surahResults,
        ayahResults: ayahResults,
      ));
    } catch (e) {
      emit(SearchError(e.toString()));
    }
  }
}

// ---- States ----

abstract class SearchState {}

class SearchInitial extends SearchState {}

class SearchHistory extends SearchState {
  final List<String> history;
  SearchHistory({required this.history});
}

class SearchLoading extends SearchState {}

class SearchResult extends SearchState {
  final String query;
  final List<Surah> surahResults;
  final List<MapEntry<Surah, List<int>>> ayahResults;

  SearchResult({
    required this.query,
    required this.surahResults,
    required this.ayahResults,
  });
}

class SearchError extends SearchState {
  final String message;
  SearchError(this.message);
}

// ---- Screen ----

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final quranRepo = RepositoryProvider.of<QuranRepository>(context);
        final searchHistoryRepo =
            RepositoryProvider.of<SearchHistoryRepository>(context);
        return SearchCubit(quranRepo, searchHistoryRepo)..loadHistory();
      },
      child: const _SearchView(),
    );
  }
}

class _SearchView extends StatefulWidget {
  const _SearchView();

  @override
  State<_SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<_SearchView> {
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
        title: const Text('Search'),
      ),
      body: Column(
        children: [
          // Search Input
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Search Quran...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          context.read<SearchCubit>().search('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: theme.colorScheme.surface,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              textInputAction: TextInputAction.search,
              onChanged: (query) {
                setState(() {});
                // Debounce search
                Future.delayed(const Duration(milliseconds: 300), () {
                  if (query == _searchController.text) {
                    context.read<SearchCubit>().search(query);
                  }
                });
              },
              onSubmitted: (query) =>
                  context.read<SearchCubit>().search(query),
            ),
          ),

          // Results
          Expanded(
            child: BlocBuilder<SearchCubit, SearchState>(
              builder: (context, state) {
                if (state is SearchInitial) {
                  return const SizedBox();
                }

                if (state is SearchLoading) {
                  return const LoadingShimmer(itemCount: 5);
                }

                if (state is SearchHistory) {
                  if (state.history.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search,
                              size: 64,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.3)),
                          const SizedBox(height: 16),
                          Text(
                            'Search the Quran',
                            style: theme.textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Search by surah name or verse text',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    );
                  }

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                        child: Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Recent Searches',
                                style: theme.textTheme.titleSmall),
                            TextButton(
                              onPressed: () => context
                                  .read<SearchCubit>()
                                  .loadHistory(),
                              child: const Text('Clear'),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: ListView(
                          children: state.history
                              .map((query) => ListTile(
                                    leading: const Icon(
                                        Icons.history, size: 20),
                                    title: Text(query),
                                    onTap: () {
                                      _searchController.text = query;
                                      context
                                          .read<SearchCubit>()
                                          .search(query);
                                    },
                                  ))
                              .toList(),
                        ),
                      ),
                    ],
                  );
                }

                if (state is SearchResult) {
                  if (state.surahResults.isEmpty &&
                      state.ayahResults.isEmpty) {
                    return Center(
                      child: Text(
                        'No results found for "${state.query}"',
                        style: theme.textTheme.bodyLarge,
                      ),
                    );
                  }

                  return ListView(
                    padding: const EdgeInsets.only(bottom: 16),
                    children: [
                      if (state.surahResults.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                          child: Text('Surahs',
                              style: theme.textTheme.titleSmall),
                        ),
                        ...state.surahResults.map((surah) => ListTile(
                              leading: CircleAvatar(
                                backgroundColor: theme.colorScheme.primary
                                    .withValues(alpha: 0.1),
                                child: Text(
                                  '${surah.number}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                              ),
                              title: Text(surah.englishName),
                              subtitle: Text(surah.englishNameTranslation),
                              onTap: () => context
                                  .push('/surah/${surah.number}'),
                            )),
                      ],

                      if (state.ayahResults.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                          child: Text('Verses',
                              style: theme.textTheme.titleSmall),
                        ),
                        ...state.ayahResults.expand((entry) {
                          final surah = entry.key;
                          return entry.value.map((ayahNum) => ListTile(
                                leading: CircleAvatar(
                                  backgroundColor:
                                      theme.colorScheme.secondary
                                          .withValues(alpha: 0.1),
                                  child: Text(
                                    '$ayahNum',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color:
                                          theme.colorScheme.secondary,
                                    ),
                                  ),
                                ),
                                title: Text(surah.englishName),
                                subtitle: Text('Ayah $ayahNum'),
                                onTap: () => context.push(
                                  '/surah/${surah.number}?ayah=$ayahNum',
                                ),
                              ));
                        }),
                      ],
                    ],
                  );
                }

                if (state is SearchError) {
                  return Center(child: Text('Error: ${state.message}'));
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
