import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LibraryService } from './library.service';

@ApiTags('Library')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // ── Bookmarks ─────────────────────────────────────────────

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get all bookmarks for a user' })
  getBookmarks(@Query('userId') userId: string) {
    return this.libraryService.getBookmarks(userId);
  }

  @Post('bookmarks')
  @ApiOperation({ summary: 'Create a bookmark' })
  createBookmark(@Query('userId') userId: string, @Body() body: any) {
    return this.libraryService.createBookmark(userId, body);
  }

  @Delete('bookmarks/:id')
  @ApiOperation({ summary: 'Delete a bookmark' })
  deleteBookmark(@Query('userId') userId: string, @Param('id') id: string) {
    return this.libraryService.deleteBookmark(userId, id);
  }

  @Post('bookmarks/sync')
  @ApiOperation({ summary: 'Sync local bookmarks to server' })
  syncBookmarks(@Query('userId') userId: string, @Body() body: { bookmarks: any[] }) {
    return this.libraryService.syncBookmarks(userId, body.bookmarks);
  }

  // ── Highlights ────────────────────────────────────────────

  @Get('highlights')
  @ApiOperation({ summary: 'Get all highlights for a user' })
  getHighlights(@Query('userId') userId: string) {
    return this.libraryService.getHighlights(userId);
  }

  @Post('highlights')
  @ApiOperation({ summary: 'Create a highlight' })
  createHighlight(@Query('userId') userId: string, @Body() body: any) {
    return this.libraryService.createHighlight(userId, body);
  }

  @Delete('highlights/:id')
  @ApiOperation({ summary: 'Delete a highlight' })
  deleteHighlight(@Query('userId') userId: string, @Param('id') id: string) {
    return this.libraryService.deleteHighlight(userId, id);
  }

  // ── Notes ─────────────────────────────────────────────────

  @Get('notes')
  @ApiOperation({ summary: 'Get all notes for a user' })
  getNotes(@Query('userId') userId: string) {
    return this.libraryService.getNotes(userId);
  }

  @Post('notes')
  @ApiOperation({ summary: 'Create a note' })
  createNote(@Query('userId') userId: string, @Body() body: any) {
    return this.libraryService.createNote(userId, body);
  }

  @Put('notes/:id')
  @ApiOperation({ summary: 'Update a note' })
  updateNote(@Query('userId') userId: string, @Param('id') id: string, @Body() body: { content: string }) {
    return this.libraryService.updateNote(userId, id, body.content);
  }

  @Delete('notes/:id')
  @ApiOperation({ summary: 'Delete a note' })
  deleteNote(@Query('userId') userId: string, @Param('id') id: string) {
    return this.libraryService.deleteNote(userId, id);
  }

  // ── Collections ───────────────────────────────────────────

  @Get('collections')
  @ApiOperation({ summary: 'Get all collections for a user' })
  getCollections(@Query('userId') userId: string) {
    return this.libraryService.getCollections(userId);
  }

  @Post('collections')
  @ApiOperation({ summary: 'Create a collection' })
  createCollection(@Query('userId') userId: string, @Body() body: any) {
    return this.libraryService.createCollection(userId, body);
  }

  @Post('collections/:id/items')
  @ApiOperation({ summary: 'Add item to collection' })
  addCollectionItem(
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.libraryService.addCollectionItem(userId, id, body);
  }

  // ── Reading History ───────────────────────────────────────

  @Get('history')
  @ApiOperation({ summary: 'Get reading history' })
  getReadingHistory(@Query('userId') userId: string, @Query('limit') limit?: string) {
    return this.libraryService.getReadingHistory(userId, limit ? parseInt(limit, 10) : 50);
  }

  @Post('history')
  @ApiOperation({ summary: 'Record a reading event' })
  recordReading(@Query('userId') userId: string, @Body() body: any) {
    return this.libraryService.recordReading(userId, body);
  }
}
