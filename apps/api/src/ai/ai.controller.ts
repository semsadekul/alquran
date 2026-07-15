import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('ask-quran')
  @ApiOperation({ summary: 'Ask a question and get Quran-based answers with citations' })
  @ApiQuery({ name: 'q', required: true, description: 'Question to ask' })
  askQuran(@Query('q') question: string) {
    return this.aiService.askQuran(question);
  }

  @Get('ask-hadith')
  @ApiOperation({ summary: 'Ask a question and get hadith-based answers with citations' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'collection', required: false })
  askHadith(@Query('q') question: string, @Query('collection') collection?: string) {
    return this.aiService.askHadith(question, collection);
  }

  @Get('topic')
  @ApiOperation({ summary: 'Explore a topic across Quran and Hadith' })
  @ApiQuery({ name: 'q', required: true, description: 'Topic to explore' })
  topicExplorer(@Query('q') topic: string) {
    return this.aiService.topicExplorer(topic);
  }
}
