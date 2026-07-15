import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:al_quran/app.dart';

void main() {
  group('App Initialization', () {
    testWidgets('App should render without crashing', (WidgetTester tester) async {
      // Build our app and trigger a frame.
      await tester.pumpWidget(const AlQuranApp());

      // Verify that the app renders.
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('App should have SurahListScreen as initial route', (WidgetTester tester) async {
      await tester.pumpWidget(const AlQuranApp());

      // Verify that the app starts with the SurahListScreen
      expect(find.byType(SurahListScreen), findsOneWidget);
    });
  });
}
