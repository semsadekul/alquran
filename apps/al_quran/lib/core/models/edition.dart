import 'package:equatable/equatable.dart';

class Edition extends Equatable {
  final String identifier;
  final String language;
  final String name;
  final String englishName;
  final String format;
  final String type;
  final String? direction;

  const Edition({
    required this.identifier,
    required this.language,
    required this.name,
    required this.englishName,
    required this.format,
    required this.type,
    this.direction,
  });

  factory Edition.fromJson(Map<String, dynamic> json) {
    return Edition(
      identifier: json['identifier'] as String,
      language: json['language'] as String,
      name: json['name'] as String,
      englishName: json['englishName'] as String,
      format: json['format'] as String,
      type: json['type'] as String,
      direction: json['direction'] as String?,
    );
  }

  @override
  List<Object?> get props => [
        identifier,
        language,
        name,
        englishName,
        format,
        type,
      ];
}
