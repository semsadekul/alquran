import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HadithService } from './hadith.service';

@ApiTags('Hadith')
@Controller('hadith')
export class HadithController {
  constructor(private readonly hadithService: HadithService) {}

  @Get('collections')
  @ApiOperation({ summary: 'Get all hadith collections' })
  getCollections() {
    return this.hadithService.getCollections();
  }

  @Get('collections/:slug')
  @ApiOperation({ summary: 'Get collection detail with books' })
  getCollection(@Param('slug') slug: string) {
    return this.hadithService.getCollection(slug);
  }

  @Get('collections/:slug/books')
  @ApiOperation({ summary: 'Get books in a collection' })
  getBooks(@Param('slug') slug: string) {
    return this.hadithService.getBooks(slug);
  }

  @Get('books/:bookId/chapters')
  @ApiOperation({ summary: 'Get chapters in a book' })
  getChapters(@Param('bookId') bookId: string) {
    return this.hadithService.getChapters(bookId);
  }

  @Get('books/:bookId/entries')
  @ApiOperation({ summary: 'Get hadith entries in a book' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getEntries(
    @Param('bookId') bookId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.hadithService.getEntries(
      bookId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50
    );
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get a specific hadith entry' })
  getEntry(@Param('id') id: string) {
    return this.hadithService.getEntry(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search hadith entries' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'collection', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(
    @Query('q') query: string,
    @Query('collection') collection?: string,
    @Query('limit') limit?: string
  ) {
    return this.hadithService.search(
      query,
      collection,
      limit ? parseInt(limit, 10) : 50
    );
  }
}
