import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { QuranModule } from './quran/quran.module';
import { SearchModule } from './search/search.module';
import { LibraryModule } from './library/library.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QuranModule,
    SearchModule,
    LibraryModule,
    AuthModule,
    SyncModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
