import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart' as path_provider;
import 'app.dart';
import 'config/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive with a custom path
  final appDocDir = await path_provider.getApplicationDocumentsDirectory();
  Hive.init(appDocDir.path);

  // Open required boxes
  await Future.wait([
    Hive.openBox(AppConstants.settingsBox),
    Hive.openBox(AppConstants.bookmarksBox),
    Hive.openBox(AppConstants.lastReadBox),
    Hive.openBox(AppConstants.cacheBox),
    Hive.openBox(AppConstants.searchHistoryBox),
  ]);

  // Register adapters (needed for custom objects - using Map-based storage for now)
  // In a future phase, we can use Hive TypeAdapters for direct object storage

  runApp(const AlQuranApp());
}
