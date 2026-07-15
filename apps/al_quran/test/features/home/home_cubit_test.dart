import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:al_quran/core/models/reading_position.dart';
import 'package:al_quran/core/repositories/settings_repository.dart';
import 'package:al_quran/features/home/cubit/home_cubit.dart';

void main() {
  late HomeCubit homeCubit;
  late MockSettingsRepository mockRepository;

  class MockSettingsRepository extends SettingsRepository {
    @override
    ReadingPosition? getLastReadPosition() {
      return ReadingPosition(
        surahNumber: 2,
        ayahNumber: 5,
        timestamp: DateTime.now(),
      );
    }

    @override
    void saveLastReadPosition(ReadingPosition position) {
      // Mock implementation
    }

    @override
    void clearLastReadPosition() {
      // Mock implementation
    }
  }

  setUp(() {
    mockRepository = MockSettingsRepository();
    homeCubit = HomeCubit(mockRepository);
  });

  tearDown(() {
    homeCubit.close();
  });

  group('HomeCubit', () {
    test('initial state should be HomeInitial', () {
      expect(homeCubit.state, equals(HomeInitial()));
    });

    test('should emit HomeLoading when loadHome is called', () {
      expectLater(
        homeCubit.stream,
        emitsInOrder([HomeLoading(), HomeLoaded(lastRead: isNotNull)]),
      );
      homeCubit.loadHome();
    });

    test('should emit HomeLoaded with last read position', () {
      expectLater(
        homeCubit.stream,
        emitsInOrder([
          HomeLoading(),
          HomeLoaded(lastRead: isNotNull),
        ]),
      );
      homeCubit.loadHome();
    });

    test('should clear last read position and reload', () {
      expectLater(
        homeCubit.stream,
        emitsInOrder([
          HomeLoading(),
          HomeLoaded(lastRead: isNotNull),
          HomeLoading(),
          HomeLoaded(lastRead: isNull),
        ]),
      );
      homeCubit.loadHome();
      homeCubit.clearLastRead();
    });
  });
}
