import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { notificationEntity } from '../../../../notifications/infrastructure/persistence/relational/entities/notification.entity';
import { notificationSeedService } from './notification-seed.service';
import { StoryEntity } from '../../../../stories/infrastructure/persistence/relational/entities/story.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([notificationEntity, StoryEntity, UserEntity]),
  ],
  providers: [notificationSeedService],
  exports: [notificationSeedService],
})
export class notificationSeedModule {}
