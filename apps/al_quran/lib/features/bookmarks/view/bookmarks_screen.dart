import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/bookmark.dart';
import '../../../core/repositories/settings_repository.dart';
import '../../../shared/widgets/loading_shimmer.dart';

// ---- BLoC ----

class BookmarksCubit extends Cubit<BookmarksState> {
  final BookmarkRepository _bookmarkRepo;

  BookmarksCubit(this._bookmarkRepo) : super(BookmarksInitial());

  void loadBookmarks() {
    emit(BookmarksLoading());
    try {
      final bookmarks = _bookmarkRepo.getAllBookmarks();
      emit(BookmarksLoaded(bookmarks: bookmarks));
    } catch (e) {
      emit(BookmarksError(e.toString()));
    }
  }

  Future<void> removeBookmark(String id) async {
    await _bookmarkRepo.removeBookmark(id);
    loadBookmarks();
  }

  void search(String query) {
    final allBookmarks = _bookmarkRepo.getAllBookmarks();
    if (query.isEmpty) {
      emit(BookmarksLoaded(bookmarks: allBookmarks));
      return;
    }
    final results = _bookmarkRepo.searchBookmarks(query);
    emit(BookmarksLoaded(bookmarks: results));
  }
}

// ---- States ----

abstract class BookmarksState {}

class BookmarksInitial extends BookmarksState {}

class BookmarksLoading extends BookmarksState {}

class BookmarksLoaded extends BookmarksState {
  final List<Bookmark> bookmarks;
  BookmarksLoaded({required this.bookmarks});
}

class BookmarksError extends BookmarksState {
  final String message;
  BookmarksError(this.message);
}

// ---- Screen ----

class BookmarksScreen extends StatelessWidget {
  const BookmarksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final repo = RepositoryProvider.of<BookmarkRepository>(context);
        return BookmarksCubit(repo)..loadBookmarks();
      },
      child: const _BookmarksView(),
    );
  }
}

class _BookmarksView extends StatefulWidget {
  const _BookmarksView();

  @override
  State<_BookmarksView> createState() => _BookmarksViewState();
}

class _BookmarksViewState extends State<_BookmarksView> {
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
        title: const Text('Bookmarks'),
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search bookmarks...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          context.read<BookmarksCubit>().search('');
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
              onChanged: (query) {
                setState(() {});
                context.read<BookmarksCubit>().search(query);
              },
            ),
          ),

          // List
          Expanded(
            child: BlocBuilder<BookmarksCubit, BookmarksState>(
              builder: (context, state) {
                if (state is BookmarksLoading) {
                  return const LoadingShimmer(itemCount: 5);
                }

                if (state is BookmarksError) {
                  return Center(
                    child: Text('Error: ${state.message}'),
                  );
                }

                if (state is BookmarksLoaded) {
                  if (state.bookmarks.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.bookmark_border,
                            size: 64,
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.3),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No bookmarks yet',
                            style: theme.textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Tap the bookmark icon on any ayah\nto save it here',
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async =>
                        context.read<BookmarksCubit>().loadBookmarks(),
                    child: ListView.builder(
                      padding: const EdgeInsets.only(bottom: 16),
                      itemCount: state.bookmarks.length,
                      itemBuilder: (context, index) {
                        final bookmark = state.bookmarks[index];
                        return Dismissible(
                          key: Key(bookmark.id),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20),
                            color: Colors.red,
                            child: const Icon(Icons.delete,
                                color: Colors.white),
                          ),
                          onDismissed: (_) => context
                              .read<BookmarksCubit>()
                              .removeBookmark(bookmark.id),
                          child: Card(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: theme.colorScheme.primary
                                    .withValues(alpha: 0.1),
                                child: Text(
                                  '${bookmark.surahNumber}:${bookmark.ayahNumber}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                              ),
                              title: Text(
                                bookmark.surahName,
                                style: theme.textTheme.bodyMedium
                                    ?.copyWith(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (bookmark.textPreview != null)
                                    Text(
                                      bookmark.textPreview!,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodySmall,
                                    ),
                                  if (bookmark.note != null &&
                                      bookmark.note!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text(
                                        '📝 ${bookmark.note}',
                                        style: theme.textTheme.bodySmall
                                            ?.copyWith(
                                                fontStyle: FontStyle.italic),
                                      ),
                                    ),
                                  Text(
                                    _formatDate(bookmark.timestamp),
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurface
                                          .withValues(alpha: 0.5),
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                              isThreeLine: true,
                              onTap: () => context.push(
                                '/surah/${bookmark.surahNumber}?ayah=${bookmark.ayahNumber}',
                              ),
                            ),
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

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
