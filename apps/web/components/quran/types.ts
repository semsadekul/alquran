export interface ReaderAyah {
  number: number;
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  banglaTransliteration?: string;
}

export interface ReaderSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}
