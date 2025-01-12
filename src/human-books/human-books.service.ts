import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHumanBooksDto } from './dto/create-human-books.dto';
import { UpdateHumanBooksDto } from './dto/update-human-books.dto';
import { HumanBooksRepository } from './infrastructure/persistence/human-books.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { HumanBooks } from './domain/human-books';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';
import { TopicsRepository } from '../topics/infrastructure/persistence/topics.repository';
import { User } from '../users/domain/user';

@Injectable()
export class HumanBooksService {
  constructor(
    private readonly humanBooksRepository: HumanBooksRepository,
    private readonly usersRepository: UserRepository,
    private readonly topicsRepository: TopicsRepository,
  ) {}

  async create(createHumanBooksDto: CreateHumanBooksDto): Promise<HumanBooks> {
    const clonedPayload = {
      ...createHumanBooksDto,
    };

    const user = await this.usersRepository.findById(
      Number(clonedPayload.user.id),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const topics = await this.topicsRepository.findByIds(
      clonedPayload.topics.map((topic) => topic.id),
    );

    if (topics.length !== clonedPayload.topics.length) {
      throw new NotFoundException('Topics not found');
    }

    return this.humanBooksRepository.create({
      ...clonedPayload,
      user,
      topics,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.humanBooksRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findOne(id: HumanBooks['id']) {
    return this.humanBooksRepository.findById(id);
  }

  update(id: HumanBooks['id'], updateHumanBooksDto: UpdateHumanBooksDto) {
    const educationStart = updateHumanBooksDto.educationStart
      ? new Date(updateHumanBooksDto.educationStart)
      : null;
    const educationEnd = updateHumanBooksDto.educationEnd
      ? new Date(updateHumanBooksDto.educationEnd)
      : null;

    return this.humanBooksRepository.update(id, {
      ...updateHumanBooksDto,
      educationStart,
      educationEnd,
    });
  }

  remove(id: HumanBooks['id']) {
    return this.humanBooksRepository.remove(id);
  }

  findByUserId(userId: User['id']) {
    return this.humanBooksRepository.findByUserId(userId);
  }
}
