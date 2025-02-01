import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicsDto } from './dto/create-topics.dto';
import { UpdateTopicsDto } from './dto/update-topics.dto';
import { TopicsRepository } from './infrastructure/persistence/topics.repository';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Topics } from './domain/topics';

@Injectable()
export class TopicsService {
  constructor(private readonly topicsRepository: TopicsRepository) {}

  create(createTopicsDto: CreateTopicsDto) {
    return this.topicsRepository.create(createTopicsDto);
  }

  findAllWithPagination({
    paginationOptions,
    name,
  }: {
    paginationOptions: IPaginationOptions;
    name?: string;
  }) {
    return this.topicsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      name,
    });
  }

  async findOne(id: Topics['id']): Promise<Topics | null> {
    const topic = await this.topicsRepository.findById(id);

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  update(id: Topics['id'], updateTopicsDto: UpdateTopicsDto) {
    return this.topicsRepository.update(id, updateTopicsDto);
  }

  remove(id: Topics['id']) {
    return this.topicsRepository.remove(id);
  }
}
