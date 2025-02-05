import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';
import { TopicSeedService } from './topic-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([TopicsEntity])],
  providers: [TopicSeedService],
  exports: [TopicSeedService],
})
export class TopicSeedModule {}
