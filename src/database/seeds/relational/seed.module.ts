import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '@database/typeorm-config.service';
import { GenderSeedModule } from './gender/gender-seed.module';
import { RoleSeedModule } from './role/role-seed.module';
import { StatusSeedModule } from './status/status-seed.module';
import { UserSeedModule } from './user/user-seed.module';
import databaseConfig from '@database/config/database.config';
import appConfig from '@config/app.config';
import { TopicSeedModule } from './topic/topic-seed.module';
import { PrismaModule } from '@prisma-client/prisma-client.module';
import { StoryReviewSeedModule } from './story-review/story-review-seed.module';
import { StorySeedModule } from './story/story-seed.module';
import { TimeSlotSeedModule } from './time-slot/time-slot-seed.module';
import { ReadingSessionSeedModule } from './reading-session/reading-session-seed.module';
@Module({
  imports: [
    GenderSeedModule,
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    TopicSeedModule,
    StorySeedModule,
    StoryReviewSeedModule,
    TimeSlotSeedModule,
    ReadingSessionSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    PrismaModule,
  ],
})
export class SeedModule {}
