import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SyncService, SyncPayload } from './sync.service';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({ summary: 'Sync local library data to server' })
  sync(@Query('userId') userId: string, @Body() payload: SyncPayload) {
    return this.syncService.sync(userId, payload);
  }

  @Get('library')
  @ApiOperation({ summary: 'Get full library for a user (for initial sync to new device)' })
  getFullLibrary(@Query('userId') userId: string) {
    return this.syncService.getFullLibrary(userId);
  }
}
