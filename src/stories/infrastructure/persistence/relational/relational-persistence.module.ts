import { Module } from '@nestjs/common';
import { StoryRepository } from '../story.repository';
import { StoriesRelationalRepository } from './repositories/story.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryEntity } from './entities/story.entity';
import { UsersRelationalRepository } from '../../../../users/infrastructure/persistence/relational/repositories/user.repository';
import { UserRepository } from '../../../../users/infrastructure/persistence/user.repository';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TopicsRepository } from '../../../../topics/infrastructure/persistence/topics.repository';
import { TopicsRelationalRepository } from '../../../../topics/infrastructure/persistence/relational/repositories/topics.repository';
import { TopicsEntity } from '../../../../topics/infrastructure/persistence/relational/entities/topics.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([StoryEntity]),
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([TopicsEntity]),
  ],

  providers: [
    {
      provide: StoryRepository,
      useClass: StoriesRelationalRepository,
    },
    {
      provide: UserRepository,
      useClass: UsersRelationalRepository,
    },
    {
      provide: TopicsRepository,
      useClass: TopicsRelationalRepository,
    },
  ],
  exports: [StoryRepository, UserRepository, TopicsRepository],
})
export class RelationalStoriesPersistenceModule {}
