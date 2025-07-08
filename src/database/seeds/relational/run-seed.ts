import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { GenderSeedService } from './gender/gender-seed.service';
import { ReadingSessionSeedService } from './reading-session/reading-session-seed.service';
import { StorySeedService } from '@database/seeds/relational/story/story-seed.service';
import { TimeSlotSeedService } from '@database/seeds/relational/time-slot/time-slot-seed.service';
import { TopicSeedService } from '@database/seeds/relational/topic/topic-seed.service';
import { NotificationSeedService } from './notification/notification-seed.service';
import { NotificationTypeSeedService } from './notification-type/notification-type-seed.service';
import { ChatSeedService } from './chat/chat-seed.service';
import { ChatTypeSeedService } from './chat-type/chat-type-seed.service';
import { StickerSeedService } from '@database/seeds/relational/sticker/sticker-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(GenderSeedService).run();
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(TopicSeedService).run();
  await app.get(StorySeedService).run();
  await app.get(TimeSlotSeedService).run();
  await app.get(ReadingSessionSeedService).run();
  await app.get(NotificationTypeSeedService).run();
  await app.get(NotificationSeedService).run();
  await app.get(ChatTypeSeedService).run();
  await app.get(StickerSeedService).run();
  await app.get(ChatSeedService).run();

  await app.close();
};

void runSeed();
