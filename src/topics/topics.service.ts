import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTopicsDto } from './dto/create-topics.dto';
import { UpdateTopicsDto } from './dto/update-topics.dto';
import { TopicsRepository } from './infrastructure/persistence/topics.repository';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Topics } from './domain/topics';
import { TopicColor } from './topic-color.enum';
import { TopicStatus } from './topic-status.enum';

import { PermissionService } from '@casl/services/permission.service';
import { User } from '@users/domain/user';

@Injectable()
export class TopicsService {
  constructor(
    private readonly topicsRepository: TopicsRepository,
    private readonly permissionService: PermissionService,
  ) {}

  async create(createTopicsDto: CreateTopicsDto) {
    const name = createTopicsDto.name.trim();
    const existing = await this.topicsRepository.findByName(name);

    if (existing) {
      throw new ConflictException(
        'A topic with this name already exists (active or inactive)',
      );
    }

    return this.topicsRepository.create({
      name,
      color: createTopicsDto.color ?? TopicColor.primary,
      status: createTopicsDto.status ?? TopicStatus.inactive,
    });
  }

  async findAllWithPagination({
    paginationOptions,
    name,
    user,
  }: {
    paginationOptions: IPaginationOptions;
    name?: string;
    user?: User;
  }): Promise<{ data: Topics[]; total: number }> {
    const status = user && this.permissionService.canManageTopics(user)
      ? undefined
      : TopicStatus.active;

    return this.topicsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      name,
      status,
    });
  }

  findTop3Popular() {
    return this.topicsRepository.findTop3PopularTopics();
  }

  async findOne(id: Topics['id'], user: User): Promise<Topics | null> {
    const topic = await this.topicsRepository.findById(id);

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (!this.permissionService.canReadTopic(user, topic)) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async update(id: Topics['id'], updateTopicsDto: UpdateTopicsDto) {
    if (updateTopicsDto.name !== undefined) {
      const name = updateTopicsDto.name.trim();
      const existing = await this.topicsRepository.findByName(name, id);

      if (existing) {
        throw new ConflictException(
          'A topic with this name already exists (active or inactive)',
        );
      }

      updateTopicsDto = { ...updateTopicsDto, name };
    }

    return this.topicsRepository.update(id, updateTopicsDto);
  }

  remove(id: Topics['id']) {
    return this.topicsRepository.remove(id);
  }
}
