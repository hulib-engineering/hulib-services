import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';

@Injectable()
export class TopicSeedService {
  constructor(
    @InjectRepository(TopicsEntity)
    private repository: Repository<TopicsEntity>,
  ) {}

  async run() {
    const countTopics = await this.repository.count();

    if (!countTopics) {
      await this.repository.save(
        this.repository.create({
          id: 1,
          name: 'Topic 1',
        }),
      );
    }
  }
}
