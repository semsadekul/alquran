import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuranService } from './quran.service';

@ApiTags('Quran')
@Controller('quran')
export class QuranController {
  constructor(private readonly quranService: QuranService) {}

  @Get('surahs')
  @ApiOperation({ summary: 'Get all 114 surahs' })
  getSurahs() {
    return this.quranService.getSurahs();
  }

  @Get('surahs/:number')
  @ApiOperation({ summary: 'Get surah metadata by number' })
  getSurah(@Param('number', ParseIntPipe) number: number) {
    return this.quranService.getSurah(number);
  }

  @Get('surahs/:number/verses')
  @ApiOperation({ summary: 'Get all verses in a surah' })
  getVersesBySurah(@Param('number', ParseIntPipe) number: number) {
    return this.quranService.getVersesBySurah(number);
  }

  @Get('surahs/:surah/verses/:ayah')
  @ApiOperation({ summary: 'Get a specific verse' })
  getVerse(
    @Param('surah', ParseIntPipe) surah: number,
    @Param('ayah', ParseIntPipe) ayah: number
  ) {
    return this.quranService.getVerse(surah, ayah);
  }
}
