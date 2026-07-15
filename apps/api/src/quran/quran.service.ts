import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuranService {
  constructor(private prisma: PrismaService) {}

  async getSurahs() {
    return this.prisma.quranSurah.findMany({
      orderBy: { number: 'asc' }
    });
  }

  async getSurah(number: number) {
    const surah = await this.prisma.quranSurah.findUnique({
      where: { number }
    });
    if (!surah) throw new NotFoundException(`Surah ${number} not found`);
    return surah;
  }

  async getVersesBySurah(surahNumber: number) {
    return this.prisma.quranAyah.findMany({
      where: { surahNumber },
      orderBy: { ayahInSurah: 'asc' }
    });
  }

  async getVerse(surahNumber: number, ayahNumber: number) {
    const verse = await this.prisma.quranAyah.findFirst({
      where: { surahNumber, ayahInSurah: ayahNumber }
    });
    if (!verse) throw new NotFoundException(`Verse ${surahNumber}:${ayahNumber} not found`);
    return verse;
  }
}
