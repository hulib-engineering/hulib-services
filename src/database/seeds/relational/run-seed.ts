import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { GenderSeedService } from './gender/gender-seed.service';
import { TopicSeedService } from './topic/topic-seed.service';
import { TimeSlotSeedService } from './time-slot/time-slot-seed.service';
// import { StoryReviewSeedService } from './story-review/story-review-seed.service';
// import { StorySeedService } from './story/story-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(GenderSeedService).run();
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(TopicSeedService).run();
  // await app.get(StorySeedService).run();
  // await app.get(StoryReviewSeedService).run();
  await app.get(TimeSlotSeedService).run();

  await app.close();
};

void runSeed();
