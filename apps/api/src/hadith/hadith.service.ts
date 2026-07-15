import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class HadithService {
  constructor(private prisma: PrismaService) {}

  async getCollections() {
    return this.prisma.hadithCollection.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { nameEnglish: 'asc' }
    });
  }

  async getCollection(slug: string) {
    const collection = await this.prisma.hadithCollection.findUnique({
      where: { slug },
      include: { books: { orderBy: { number: 'asc' } } }
    });
    if (!collection) throw new NotFoundException(`Collection '${slug}' not found`);
    return collection;
  }

  async getBooks(collectionSlug: string) {
    const collection = await this.prisma.hadithCollection.findUnique({
      where: { slug: collectionSlug }
    });
    if (!collection) throw new NotFoundException(`Collection '${collectionSlug}' not found`);

    return this.prisma.hadithBook.findMany({
      where: { collectionId: collection.id },
      orderBy: { number: 'asc' }
    });
  }

  async getChapters(bookId: string) {
    return this.prisma.hadithChapter.findMany({
      where: { bookId },
      orderBy: { number: 'asc' }
    });
  }

  async getEntries(bookId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      this.prisma.hadithEntry.findMany({
        where: { bookId },
        orderBy: { numberInBook: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.hadithEntry.count({ where: { bookId } })
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getEntry(id: string) {
    const entry = await this.prisma.hadithEntry.findUnique({
      where: { id },
      include: {
        collection: true,
        book: true,
        chapter: true
      }
    });
    if (!entry) throw new NotFoundException(`Hadith entry '${id}' not found`);
    return entry;
  }

  async search(query: string, collectionSlug?: string, limit: number = 50) {
    const where: any = {
      OR: [
        { arabic: { contains: query } },
        { bangla: { contains: query } },
        { english: { contains: query } },
        { narrator: { contains: query } }
      ]
    };

    if (collectionSlug) {
      const collection = await this.prisma.hadithCollection.findUnique({
        where: { slug: collectionSlug }
      });
      if (collection) {
        where.collectionId = collection.id;
      }
    }

    return this.prisma.hadithEntry.findMany({
      where,
      take: limit,
      include: { collection: true, book: true },
      orderBy: { numberInBook: 'asc' }
    });
  }
}
