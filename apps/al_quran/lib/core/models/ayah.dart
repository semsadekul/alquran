import 'package:equatable/equatable.dart';

class Ayah extends Equatable {
  final int number;
  final String text;
  final int numberInSurah;
  final int juz;
  final int? manzil;
  final int page;
  final int? ruku;
  final int hizbQuarter;
  final bool sajda;

  // Translation layers (loaded separately)
  final String? bangla;
  final String? english;
  final String? transliteration;
  final String? banglaPronunciation;

  const Ayah({
    required this.number,
    required this.text,
    required this.numberInSurah,
    required this.juz,
    this.manzil,
    required this.page,
    this.ruku,
    required this.hizbQuarter,
    this.sajda = false,
    this.bangla,
    this.english,
    this.transliteration,
    this.banglaPronunciation,
  });

  factory Ayah.fromJson(Map<String, dynamic> json) {
    return Ayah(
      number: json['number'] as int,
      text: json['text'] as String,
      numberInSurah: json['numberInSurah'] as int,
      juz: json['juz'] as int,
      manzil: json['manzil'] as int?,
      page: json['page'] as int,
      ruku: json['ruku'] as int?,
      hizbQuarter: json['hizbQuarter'] as int,
      sajda: json['sajda'] as bool? ?? false,
    );
  }

  Ayah copyWith({
    String? bangla,
    String? english,
    String? transliteration,
    String? banglaPronunciation,
  }) {
    return Ayah(
      number: number,
      text: text,
      numberInSurah: numberInSurah,
      juz: juz,
      manzil: manzil,
      page: page,
      ruku: ruku,
      hizbQuarter: hizbQuarter,
      sajda: sajda,
      bangla: bangla ?? this.bangla,
      english: english ?? this.english,
      transliteration: transliteration ?? this.transliteration,
      banglaPronunciation:
          banglaPronunciation ?? this.banglaPronunciation,
    );
  }

  @override
  List<Object?> get props => [
        number,
        text,
        numberInSurah,
        juz,
        page,
        hizbQuarter,
        sajda,
        bangla,
        english,
        transliteration,
        banglaPronunciation,
      ];
}
