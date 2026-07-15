import 'package:equatable/equatable.dart';

class ReadingPosition extends Equatable {
  final int surahNumber;
  final int ayahNumber;
  final String surahName;
  final DateTime timestamp;
  final double? scrollY;

  const ReadingPosition({
    required this.surahNumber,
    required this.ayahNumber,
    required this.surahName,
    required this.timestamp,
    this.scrollY,
  });

  factory ReadingPosition.fromJson(Map<String, dynamic> json) {
    return ReadingPosition(
      surahNumber: json['surahNumber'] as int,
      ayahNumber: json['ayahNumber'] as int,
      surahName: json['surahName'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      scrollY: (json['scrollY'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'surahNumber': surahNumber,
        'ayahNumber': ayahNumber,
        'surahName': surahName,
        'timestamp': timestamp.toIso8601String(),
        'scrollY': scrollY,
      };

  ReadingPosition copyWith({
    int? surahNumber,
    int? ayahNumber,
    String? surahName,
    DateTime? timestamp,
    double? scrollY,
  }) {
    return ReadingPosition(
      surahNumber: surahNumber ?? this.surahNumber,
      ayahNumber: ayahNumber ?? this.ayahNumber,
      surahName: surahName ?? this.surahName,
      timestamp: timestamp ?? this.timestamp,
      scrollY: scrollY ?? this.scrollY,
    );
  }

  @override
  List<Object?> get props =>
      [surahNumber, ayahNumber, surahName, timestamp, scrollY];
}
