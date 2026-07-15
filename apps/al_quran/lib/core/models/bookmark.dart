import 'package:equatable/equatable.dart';

class Bookmark extends Equatable {
  final String id;
  final int surahNumber;
  final int ayahNumber;
  final String surahName;
  final String? textPreview;
  final DateTime timestamp;
  final String? note;

  const Bookmark({
    required this.id,
    required this.surahNumber,
    required this.ayahNumber,
    required this.surahName,
    this.textPreview,
    required this.timestamp,
    this.note,
  });

  factory Bookmark.fromJson(Map<String, dynamic> json) {
    return Bookmark(
      id: json['id'] as String,
      surahNumber: json['surahNumber'] as int,
      ayahNumber: json['ayahNumber'] as int,
      surahName: json['surahName'] as String,
      textPreview: json['textPreview'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
      note: json['note'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'surahNumber': surahNumber,
        'ayahNumber': ayahNumber,
        'surahName': surahName,
        'textPreview': textPreview,
        'timestamp': timestamp.toIso8601String(),
        'note': note,
      };

  Bookmark copyWith({String? note, String? textPreview}) {
    return Bookmark(
      id: id,
      surahNumber: surahNumber,
      ayahNumber: ayahNumber,
      surahName: surahName,
      textPreview: textPreview ?? this.textPreview,
      timestamp: timestamp,
      note: note ?? this.note,
    );
  }

  @override
  List<Object?> get props => [
        id,
        surahNumber,
        ayahNumber,
        surahName,
        textPreview,
        timestamp,
        note,
      ];
}
