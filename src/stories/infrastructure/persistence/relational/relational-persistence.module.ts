import { Module } from '@nestjs/common';
import { StoryRepository } from '../story.repository';
import { StoriesRelationalRepository } from './repositories/story.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryEntity } from './entities/story.entity';
import { UsersRelationalRepository } from '../../../../users/infrastructure/persistence/relational/repositories/user.repository';
import { UserRepository } from '../../../../users/infrastructure/persistence/user.repository';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([StoryEntity]),
    TypeOrmModule.forFeature([UserEntity]),
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
  ],
  exports: [StoryRepository],
})
export class RelationalStoriesPersistenceModule {}
