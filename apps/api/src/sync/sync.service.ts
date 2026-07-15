import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface SyncPayload {
  bookmarks?: Array<{
    source: string;
    sourceId: string;
    surah?: number;
    ayah?: number;
    surahName?: string;
    textPreview?: string;
    timestamp?: number;
  }>;
  highlights?: Array<{
    source: string;
    sourceId: string;
    color?: string;
    text?: string;
    timestamp?: number;
  }>;
  notes?: Array<{
    source: string;
    sourceId: string;
    content: string;
    timestamp?: number;
  }>;
  readingHistory?: Array<{
    source: string;
    sourceId: string;
    surah?: number;
    ayah?: number;
    timestamp?: number;
  }>;
  lastSyncTimestamp?: string;
}

export interface SyncResult {
  synced: {
    bookmarks: number;
    highlights: number;
    notes: number;
    readingHistory: number;
  };
  serverTimestamp: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  async sync(userId: string, payload: SyncPayload): Promise<SyncResult> {
    const results = {
      bookmarks: 0,
      highlights: 0,
      notes: 0,
      readingHistory: 0
    };

    // Sync bookmarks
    if (payload.bookmarks) {
      for (const bm of payload.bookmarks) {
        const existing = await this.prisma.bookmark.findFirst({
          where: { userId, source: bm.source, sourceId: bm.sourceId }
        });
        if (!existing) {
          await this.prisma.bookmark.create({
            data: {
              userId,
              source: bm.source,
              sourceId: bm.sourceId,
              surah: bm.surah,
              ayah: bm.ayah,
              surahName: bm.surahName,
              textPreview: bm.textPreview
            }
          });
          results.bookmarks++;
        }
      }
    }

    // Sync highlights
    if (payload.highlights) {
      for (const hl of payload.highlights) {
        const existing = await this.prisma.highlight.findFirst({
          where: { userId, source: hl.source, sourceId: hl.sourceId }
        });
        if (!existing) {
          await this.prisma.highlight.create({
            data: {
              userId,
              source: hl.source,
              sourceId: hl.sourceId,
              color: hl.color || 'gold',
              text: hl.text
            }
          });
          results.highlights++;
        }
      }
    }

    // Sync notes
    if (payload.notes) {
      for (const note of payload.notes) {
        const existing = await this.prisma.note.findFirst({
          where: { userId, source: note.source, sourceId: note.sourceId }
        });
        if (existing) {
          // Update if server version is older
          await this.prisma.note.update({
            where: { id: existing.id },
            data: { content: note.content }
          });
        } else {
          await this.prisma.note.create({
            data: {
              userId,
              source: note.source,
              sourceId: note.sourceId,
              content: note.content
            }
          });
          results.notes++;
        }
      }
    }

    // Sync reading history
    if (payload.readingHistory) {
      for (const rh of payload.readingHistory) {
        await this.prisma.readingHistory.create({
          data: {
            userId,
            source: rh.source,
            sourceId: rh.sourceId,
            surah: rh.surah,
            ayah: rh.ayah,
            timestamp: rh.timestamp ? new Date(rh.timestamp) : new Date()
          }
        });
        results.readingHistory++;
      }
    }

    this.logger.log(`Sync for user ${userId}: ${JSON.stringify(results)}`);

    return {
      synced: results,
      serverTimestamp: new Date().toISOString()
    };
  }

  async getFullLibrary(userId: string) {
    const [bookmarks, highlights, notes, collections, history] = await Promise.all([
      this.prisma.bookmark.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.highlight.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.collection.findMany({
        where: { userId },
        include: { items: { orderBy: { sortOrder: 'asc' } } }
      }),
      this.prisma.readingHistory.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 200
      })
    ]);

    return { bookmarks, highlights, notes, collections, readingHistory: history };
  }
}
