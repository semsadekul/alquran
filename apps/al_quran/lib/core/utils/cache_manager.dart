import 'package:hive/hive.dart';
import 'package:intl/intl.dart';

class CacheManager {
  static const String _cacheBoxName = 'api_cache';
  static final DateFormat _formatter = DateFormat('yyyy-MM-dd');

  static Future<void> init() async {
    await Hive.openBox(_cacheBoxName);
  }

  static Future<void> store({
    required String key,
    required dynamic data,
    required Duration ttl,
  }) async {
    final box = await Hive.openBox(_cacheBoxName);
    final timestamp = DateTime.now().toIso8601String();
    final expiry = DateTime.now().add(ttl).toIso8601String();
    await box.put(key, {
      'data': data,
      'timestamp': timestamp,
      'expiry': expiry,
    });
  }

  static Future<dynamic> get({required String key}) async {
    final box = await Hive.openBox(_cacheBoxName);
    final entry = box.get(key) as Map<String, dynamic>?;
    if (entry == null) return null;
    final now = DateTime.now();
    final expiry = DateTime.parse(entry['expiry']);
    if (now.isAfter(expiry)) {
      await box.delete(key);
      return null;
    }
    return entry['data'];
  }

  static Future<void> clearExpired() async {
    final box = await Hive.openBox(_cacheBoxName);
    final now = DateTime.now();
    final keys = box.keys.toList();
    for (final key in keys) {
      final entry = box.get(key) as Map<String, dynamic>?;
      if (entry != null) {
        final expiry = DateTime.parse(entry['expiry']);
        if (now.isAfter(expiry)) {
          await box.delete(key);
        }
      }
    }
  }
}
