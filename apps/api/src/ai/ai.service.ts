import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

export interface Citation {
  source: 'quran' | 'hadith';
  reference: string;
  arabic?: string;
  bangla?: string;
  english?: string;
  surah?: number;
  ayah?: number;
  collection?: string;
  hadithNumber?: number;
}

export interface AiResponse {
  answer: string;
  citations: Citation[];
  disclaimer: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  async askQuran(question: string): Promise<AiResponse> {
    const relevantVerses = await this.findRelevantVerses(question);

    return {
      answer: `Based on the Quran, here is what relates to your question about "${question}":`,
      citations: relevantVerses.map(v => ({
        source: 'quran' as const,
        reference: `${v.surahNumber}:${v.ayahInSurah}`,
        arabic: v.arabic,
        bangla: v.bangla,
        english: v.english,
        surah: v.surahNumber,
        ayah: v.ayahInSurah
      })),
      disclaimer: 'This response is generated from Quranic text. For authoritative interpretation, consult qualified scholars.'
    };
  }

  async askHadith(question: string, collection?: string): Promise<AiResponse> {
    const relevantHadith = await this.findRelevantHadith(question, collection);

    return {
      answer: `Based on authenticated hadith, here is what relates to your question about "${question}":`,
      citations: relevantHadith.map(h => ({
        source: 'hadith' as const,
        reference: `${h.collection.nameEnglish} ${h.book.number}:${h.numberInBook}`,
        arabic: h.arabic,
        bangla: h.bangla || undefined,
        english: h.english || undefined,
        collection: h.collection.nameEnglish,
        hadithNumber: h.numberInBook
      })),
      disclaimer: 'This response is generated from hadith text. For authoritative interpretation, consult qualified scholars.'
    };
  }

  async topicExplorer(topic: string): Promise<AiResponse> {
    const [verses, hadith] = await Promise.all([
      this.findRelevantVerses(topic),
      this.findRelevantHadith(topic)
    ]);

    const quranCitations: Citation[] = verses.map(v => ({
      source: 'quran',
      reference: `${v.surahNumber}:${v.ayahInSurah}`,
      arabic: v.arabic,
      english: v.english,
      surah: v.surahNumber,
      ayah: v.ayahInSurah
    }));

    const hadithCitations: Citation[] = hadith.map(h => ({
      source: 'hadith',
      reference: `${h.collection.nameEnglish} ${h.book.number}:${h.numberInBook}`,
      arabic: h.arabic,
      english: h.english || undefined,
      collection: h.collection.nameEnglish,
      hadithNumber: h.numberInBook
    }));

    return {
      answer: `Topic exploration for "${topic}":`,
      citations: [...quranCitations, ...hadithCitations],
      disclaimer: 'This is a topic summary from Quran and Hadith. For comprehensive study, consult tafsir and qualified scholars.'
    };
  }

  private async findRelevantVerses(query: string) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const orConditions = terms.flatMap(term => [
      { english: { contains: term } },
      { bangla: { contains: query } },
      { transliteration: { contains: term } }
    ]);

    return this.prisma.quranAyah.findMany({
      where: { OR: orConditions },
      take: 10,
      orderBy: { number: 'asc' }
    });
  }

  private async findRelevantHadith(query: string, collectionSlug?: string) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const orConditions = terms.flatMap(term => [
      { english: { contains: term } },
      { bangla: { contains: query } },
      { narrator: { contains: term } }
    ]);

    const where: any = { OR: orConditions };
    if (collectionSlug) {
      const collection = await this.prisma.hadithCollection.findUnique({
        where: { slug: collectionSlug }
      });
      if (collection) where.collectionId = collection.id;
    }

    return this.prisma.hadithEntry.findMany({
      where,
      take: 10,
      include: { collection: true, book: true }
    });
  }
}
