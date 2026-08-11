import { Module } from '@nestjs/common';
import { StoryRepository } from '../story.repository';
import { PrismaStoriesRepository } from '../prisma/repositories/story-prisma.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRelationalRepository } from '../../../../users/infrastructure/persistence/relational/repositories/user.repository';
import { UserRepository } from '../../../../users/infrastructure/persistence/user.repository';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TopicsRepository } from '../../../../topics/infrastructure/persistence/topics.repository';
import { TopicsRelationalRepository } from '../../../../topics/infrastructure/persistence/relational/repositories/topics.repository';
import { TopicsEntity } from '../../../../topics/infrastructure/persistence/relational/entities/topics.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([TopicsEntity]),
  ],

  providers: [
    {
      provide: StoryRepository,
      useClass: PrismaStoriesRepository,
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
