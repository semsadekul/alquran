import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:al_quran/app.dart';

void main() {
  testWidgets('App should render', (WidgetTester tester) async {
    await tester.pumpWidget(const AlQuranApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
