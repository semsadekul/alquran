import 'package:equatable/equatable.dart';

enum RevelationType { meccan, medinan }

extension RevelationTypeX on RevelationType {
  String get displayName => name[0].toUpperCase() + name.substring(1);
  String get arabicName => this == RevelationType.meccan ? 'مكية' : 'مدنية';

  static RevelationType fromString(String value) {
    switch (value.toLowerCase()) {
      case 'meccan':
        return RevelationType.meccan;
      case 'medinan':
        return RevelationType.medinan;
      default:
        return RevelationType.meccan;
    }
  }
}

class Surah extends Equatable {
  final int number;
  final String name;
  final String englishName;
  final String englishNameTranslation;
  final String? banglaName;
  final int numberOfAyahs;
  final RevelationType revelationType;

  const Surah({
    required this.number,
    required this.name,
    required this.englishName,
    required this.englishNameTranslation,
    this.banglaName,
    required this.numberOfAyahs,
    required this.revelationType,
  });

  factory Surah.fromJson(Map<String, dynamic> json) {
    return Surah(
      number: json['number'] as int,
      name: json['name'] as String,
      englishName: json['englishName'] as String,
      englishNameTranslation: json['englishNameTranslation'] as String,
      banglaName: json['banglaName'] as String?,
      numberOfAyahs: json['numberOfAyahs'] as int,
      revelationType:
          RevelationTypeX.fromString(json['revelationType'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'number': number,
        'name': name,
        'englishName': englishName,
        'englishNameTranslation': englishNameTranslation,
        'banglaName': banglaName,
        'numberOfAyahs': numberOfAyahs,
        'revelationType': revelationType.name,
      };

  @override
  List<Object?> get props => [
        number,
        name,
        englishName,
        englishNameTranslation,
        numberOfAyahs,
        revelationType,
      ];
}
