import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:al_quran/core/models/surah.dart';
import 'package:al_quran/features/surah_list/cubit/surah_list_cubit.dart';

void main() {
  group('SurahListCubit', () {
    test('should initialize with default filter', () {
      final cubit = SurahListCubit();
      expect(cubit.state.filterType, equals(FilterType.all));
      expect(cubit.state.sortMode, equals(SortMode.englishName));
      expect(cubit.state.searchQuery, isEmpty);
      cubit.close();
    });

    test('should filter by type', () {
      final cubit = SurahListCubit();
      final surahs = _createMockSurahs();

      expectLater(
        cubit.stream,
        emitsInOrder([
          SurahListInitial(),
          SurahListLoaded(surahs: surahs, filterType: FilterType.all),
          SurahListLoaded(
            surahs: surahs,
            filterType: FilterType.makkan,
          ),
        ]),
      );

      cubit.filterByType(FilterType.makkan);
      cubit.close();
    });

    test('should sort by name', () {
      final cubit = SurahListCubit();
      final surahs = _createMockSurahs();

      expectLater(
        cubit.stream,
        emitsInOrder([
          SurahListInitial(),
          SurahListLoaded(surahs: surahs, sortMode: SortMode.englishName),
          SurahListLoaded(
            surahs: surahs,
            sortMode: SortMode.englishName,
          ),
        ]),
      );

      cubit.sortBy(SortMode.englishName);
      cubit.close();
    });

    test('should handle search query', () {
      final cubit = SurahListCubit();
      final surahs = _createMockSurahs();

      expectLater(
        cubit.stream,
        emitsInOrder([
          SurahListInitial(),
          SurahListLoaded(surahs: surahs, searchQuery: ''),
          SurahListLoaded(
            surahs: surahs,
            searchQuery: 'Fatiha',
          ),
        ]),
      );

      cubit.search('Fatiha');
      cubit.close();
    });

    test('should combine filter, sort, and search', () {
      final cubit = SurahListCubit();
      final surahs = _createMockSurahs();

      expectLater(
        cubit.stream,
        emitsInOrder([
          SurahListInitial(),
          SurahListLoaded(
            surahs: surahs,
            filterType: FilterType.all,
            sortMode: SortMode.englishName,
            searchQuery: '',
          ),
          SurahListLoaded(
            surahs: surahs,
            filterType: FilterType.makkan,
            sortMode: SortMode.englishName,
            searchQuery: 'Fatiha',
          ),
        ]),
      );

      cubit.filterByType(FilterType.makkan);
      cubit.sortBy(SortMode.englishName);
      cubit.search('Fatiha');
      cubit.close();
    });
  });
}

List<Surah> _createMockSurahs() {
  return [
    Surah(
      number: 1,
      name: 'Al-Fatiha',
      nameArabic: 'الفاتحة',
      englishName: 'The Opening',
      englishNameTranslation: 'The Opening',
      revelation: RevelationType.makkan,
      numberOfAyahs: 7,
      verses: [],
    ),
    Surah(
      number: 2,
      name: 'Al-Baqara',
      nameArabic: 'البقرة',
      englishName: 'The Cow',
      englishNameTranslation: 'The Cow',
      revelation: RevelationType.medinan,
      numberOfAyahs: 286,
      verses: [],
    ),
  ];
}
