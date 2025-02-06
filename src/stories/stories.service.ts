import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryRepository } from './infrastructure/persistence/story.repository';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Story } from './domain/story';
import { UsersService } from '@users/users.service';
import { PrismaService } from 'src/prisma-client/prisma.service';
@Injectable()
export class StoriesService {
  constructor(
    private readonly storiesRepository: StoryRepository,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  async create(createStoriesDto: CreateStoryDto) {
    const humanBook = await this.usersService.findById(
      createStoriesDto.humanBook.id,
    );

    if (!humanBook) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }

    return this.storiesRepository.create({ ...createStoriesDto, humanBook });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.storiesRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findOne(id: Story['id']) {
    return this.prisma.story.findUnique({
      where: { id },
    });
  }

  update(id: Story['id'], updateStoriesDto: UpdateStoryDto) {
    return this.storiesRepository.update(id, updateStoriesDto);
  }

  remove(id: Story['id']) {
    return this.storiesRepository.remove(id);
  }

  async findDetailedStory(id: number): Promise<Story> {
    const story = await this.storiesRepository.findById(id);

    if (!story) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          story: 'notFoundStory',
        },
      });
    }

    return story;
  }
}
