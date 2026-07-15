import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across Quran verses' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'mode', required: false, enum: ['all', 'arabic', 'bangla', 'english', 'transliteration'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') query: string,
    @Query('mode') mode: string = 'all',
    @Query('limit') limit?: string
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const results = await this.searchService.search(query, mode, parsedLimit);
    return { results, query, mode, total: results.length };
  }

  @Get('index')
  @ApiOperation({ summary: 'Trigger verse indexing into Meilisearch' })
  async index() {
    await this.searchService.indexVerses();
    return { status: 'Indexing triggered' };
  }
}
