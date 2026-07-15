import 'package:equatable/equatable.dart';

class Reciter extends Equatable {
  final String id;
  final String name;
  final String? arabicName;
  final String? englishName;
  final String baseUrl;

  const Reciter({
    required this.id,
    required this.name,
    this.arabicName,
    this.englishName,
    required this.baseUrl,
  });

  @override
  List<Object?> get props => [id, name, baseUrl];

  static const List<Reciter> defaults = [
    Reciter(
      id: 'Alafasy_128kbps',
      name: 'Mishary Rashid Alafasy',
      arabicName: 'مشاري راشد العفاسي',
      englishName: 'Mishary Rashid Alafasy',
      baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/',
    ),
    Reciter(
      id: 'Ghamadi_128kbps',
      name: 'Saad Al-Ghamadi',
      arabicName: 'سعد الغامدي',
      englishName: 'Saad Al-Ghamadi',
      baseUrl: 'https://everyayah.com/data/Ghamadi_128kbps/',
    ),
    Reciter(
      id: 'Husary_128kbps',
      name: 'Mahmoud Khalil Al-Husary',
      arabicName: 'محمود خليل الحصري',
      englishName: 'Mahmoud Khalil Al-Husary',
      baseUrl: 'https://everyayah.com/data/Husary_128kbps/',
    ),
    Reciter(
      id: 'Abdul_Basit_Murattal_128kbps',
      name: 'Abdul Basit Abdus Samad',
      arabicName: 'عبد الباسط عبد الصمد',
      englishName: 'Abdul Basit Abdus Samad',
      baseUrl:
          'https://everyayah.com/data/Abdul_Basit_Murattal_128kbps/',
    ),
    Reciter(
      id: 'Sudais_128kbps',
      name: 'Abdul Rahman Al-Sudais',
      arabicName: 'عبد الرحمن السديس',
      englishName: 'Abdul Rahman Al-Sudais',
      baseUrl: 'https://everyayah.com/data/Sudais_128kbps/',
    ),
  ];
}
