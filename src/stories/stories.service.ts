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
import {
  FilterStoryDto,
  SearchStoriesDto,
  SortStoryDto,
} from './dto/find-all-stories.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../utils/dto/pagination-input.dto';

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
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto | null;
    sortOptions?: SortStoryDto[] | null;
  }) {
    return this.storiesRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      filterOptions,
      sortOptions,
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

  // prisma search stories
  async searchStories(query: SearchStoriesDto) {
    const { keyword = '', page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = query;

    const keywordTrimmed = keyword?.trim().toLowerCase().replace(/\s+/g, ' ');
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // get total count of stories
    const totalCount = await this.prisma.story.count({
      where: {
        title: {
          contains: keywordTrimmed,
        },
      },
    });

    const stories = await this.prisma.story.findMany({
      where: {
        title: {
          contains: keywordTrimmed,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });

    return {
      data: stories,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      hasNextPage: Number(page) < Math.ceil(totalCount / Number(limit)),
      hasPreviousPage: Number(page) > 1,
    };
  }
}
