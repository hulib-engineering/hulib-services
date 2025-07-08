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
// import { StoryReviewSeedModule } from './story-review/story-review-seed.module';
import { StorySeedModule } from './story/story-seed.module';
import { ReadingSessionSeedModule } from './reading-session/reading-session-seed.module';
import { TimeSlotSeedModule } from '@database/seeds/relational/time-slot/time-slot-seed.module';
import { NotificationSeedModule } from './notification/notification-seed.module';
import { NotificationTypeSeedModule } from './notification-type/notification-type-seed.module';
import { ChatSeedModule } from './chat/chat-seed.module';
import { ChatTypeSeedModule } from './chat-type/chat-type-seed.module';
import { StickerSeedModule } from '@database/seeds/relational/sticker/sticker-seed.module';

@Module({
  imports: [
    GenderSeedModule,
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    TopicSeedModule,
    StorySeedModule,
    TimeSlotSeedModule,
    ReadingSessionSeedModule,
    NotificationTypeSeedModule,
    NotificationSeedModule,
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
    ChatSeedModule,
    ChatTypeSeedModule,
    StickerSeedModule,
  ],
})
export class SeedModule {}
