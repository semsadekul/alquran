import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  // ── Bookmarks ─────────────────────────────────────────────

  async getBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createBookmark(userId: string, data: {
    source: string;
    sourceId: string;
    surah?: number;
    ayah?: number;
    surahName?: string;
    textPreview?: string;
  }) {
    return this.prisma.bookmark.create({
      data: { userId, ...data }
    });
  }

  async deleteBookmark(userId: string, id: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id, userId }
    });
    if (!bookmark) throw new NotFoundException('Bookmark not found');
    return this.prisma.bookmark.delete({ where: { id } });
  }

  async syncBookmarks(userId: string, bookmarks: Array<{
    source: string;
    sourceId: string;
    surah?: number;
    ayah?: number;
    surahName?: string;
    textPreview?: string;
  }>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];
    for (const bm of bookmarks) {
      const existing = await this.prisma.bookmark.findFirst({
        where: { userId, source: bm.source, sourceId: bm.sourceId }
      });
      if (!existing) {
        results.push(await this.prisma.bookmark.create({
          data: { userId, ...bm }
        }));
      } else {
        results.push(existing);
      }
    }
    return results;
  }

  // ── Highlights ────────────────────────────────────────────

  async getHighlights(userId: string) {
    return this.prisma.highlight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createHighlight(userId: string, data: {
    source: string;
    sourceId: string;
    color?: string;
    startOffset?: number;
    endOffset?: number;
    text?: string;
  }) {
    return this.prisma.highlight.create({
      data: { userId, ...data }
    });
  }

  async deleteHighlight(userId: string, id: string) {
    const highlight = await this.prisma.highlight.findFirst({
      where: { id, userId }
    });
    if (!highlight) throw new NotFoundException('Highlight not found');
    return this.prisma.highlight.delete({ where: { id } });
  }

  // ── Notes ─────────────────────────────────────────────────

  async getNotes(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async createNote(userId: string, data: {
    source: string;
    sourceId: string;
    content: string;
  }) {
    return this.prisma.note.create({
      data: { userId, ...data }
    });
  }

  async updateNote(userId: string, id: string, content: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId }
    });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.note.update({
      where: { id },
      data: { content }
    });
  }

  async deleteNote(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId }
    });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.note.delete({ where: { id } });
  }

  // ── Collections ───────────────────────────────────────────

  async getCollections(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async createCollection(userId: string, data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) {
    return this.prisma.collection.create({
      data: { userId, ...data }
    });
  }

  async addCollectionItem(userId: string, collectionId: string, data: {
    source: string;
    sourceId: string;
    sortOrder?: number;
  }) {
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId }
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return this.prisma.collectionItem.create({
      data: { collectionId, ...data }
    });
  }

  // ── Reading History ───────────────────────────────────────

  async getReadingHistory(userId: string, limit: number = 50) {
    return this.prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  async recordReading(userId: string, data: {
    source: string;
    sourceId: string;
    surah?: number;
    ayah?: number;
  }) {
    return this.prisma.readingHistory.create({
      data: { userId, ...data }
    });
  }
}
