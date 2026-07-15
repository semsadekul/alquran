import 'package:equatable/equatable.dart';

class Tafsir extends Equatable {
  final int id;
  final String name;
  final String authorName;
  final String slug;
  final String language;
  final String? description;

  const Tafsir({
    required this.id,
    required this.name,
    required this.authorName,
    required this.slug,
    required this.language,
    this.description,
  });

  factory Tafsir.fromJson(Map<String, dynamic> json) {
    return Tafsir(
      id: json['id'] as int,
      name: json['name'] as String,
      authorName: json['author_name'] as String,
      slug: json['slug'] as String,
      language: json['language'] as String? ?? 'en',
      description: json['description'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, name, authorName, slug, language];
}

class TafsirContent extends Equatable {
  final int surahNumber;
  final int ayahNumber;
  final String text;
  final String? tafsirName;

  const TafsirContent({
    required this.surahNumber,
    required this.ayahNumber,
    required this.text,
    this.tafsirName,
  });

  @override
  List<Object?> get props => [surahNumber, ayahNumber, text];
}
