import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import MeiliSearch from 'meilisearch';

export interface SearchResult {
  number: number;
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private meili: MeiliSearch | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    const host = this.config.get<string>('MEILISEARCH_HOST');
    const key = this.config.get<string>('MEILISEARCH_API_KEY');
    if (host) {
      this.meili = new MeiliSearch({ host, apiKey: key });
      this.logger.log(`Meilisearch connected: ${host}`);
    } else {
      this.logger.warn('MEILISEARCH_HOST not set — falling back to database search');
    }
  }

  async search(query: string, mode: string = 'all', limit: number = 100): Promise<SearchResult[]> {
    if (this.meili) {
      return this.searchMeili(query, mode, limit);
    }
    return this.searchDatabase(query, mode, limit);
  }

  private async searchMeili(query: string, mode: string, limit: number): Promise<SearchResult[]> {
    if (!this.meili) return [];

    const index = this.meili.index('verses');
    const filter = this.buildMeiliFilter(mode);
    const result = await index.search(query, {
      limit,
      filter: filter || undefined,
      attributesToRetrieve: ['number', 'surah', 'ayah', 'arabic', 'bangla', 'english', 'transliteration']
    });

    return result.hits as SearchResult[];
  }

  private buildMeiliFilter(mode: string): string | null {
    // Meilisearch filtering can be extended per mode
    return null;
  }

  private async searchDatabase(query: string, mode: string, limit: number): Promise<SearchResult[]> {
    const contains = { contains: query };

    const where: any = {
      OR: this.getSearchConditions(mode, query)
    };

    const results = await this.prisma.quranAyah.findMany({
      where,
      take: limit,
      orderBy: { number: 'asc' }
    });

    return results.map(r => ({
      number: r.number,
      surah: r.surahNumber,
      ayah: r.ayahInSurah,
      arabic: r.arabic,
      bangla: r.bangla,
      english: r.english,
      transliteration: r.transliteration
    }));
  }

  private getSearchConditions(mode: string, query: string): any[] {
    switch (mode) {
      case 'arabic':
        return [{ arabic: { contains: query } }];
      case 'bangla':
        return [{ bangla: { contains: query } }];
      case 'english':
        return [{ english: { contains: query } }];
      case 'transliteration':
        return [{ transliteration: { contains: query } }];
      default:
        return [
          { arabic: { contains: query } },
          { bangla: { contains: query } },
          { english: { contains: query } },
          { transliteration: { contains: query } }
        ];
    }
  }

  async indexVerses() {
    if (!this.meili) {
      this.logger.warn('Meilisearch not configured — skipping indexing');
      return;
    }

    this.logger.log('Indexing all verses into Meilisearch...');
    const verses = await this.prisma.quranAyah.findMany({
      select: {
        number: true,
        surahNumber: true,
        ayahInSurah: true,
        arabic: true,
        bangla: true,
        english: true,
        transliteration: true
      }
    });

    const documents = verses.map(v => ({
      number: v.number,
      surah: v.surahNumber,
      ayah: v.ayahInSurah,
      arabic: v.arabic,
      bangla: v.bangla,
      english: v.english,
      transliteration: v.transliteration
    }));

    const index = this.meili.index('verses');
    await index.updateFilterableAttributes(['surah', 'mode']);
    await index.updateSortableAttributes(['surah', 'ayah']);
    await index.addDocuments(documents, { primaryKey: 'number' });

    this.logger.log(`Indexed ${documents.length} verses`);
  }
}
