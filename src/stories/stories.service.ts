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
import { FilterStoryDto, SortStoryDto } from './dto/find-all-stories.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
@Injectable()
export class StoriesService {
  constructor(
    private readonly storiesRepository: StoryRepository,
    private readonly storyReviewService: StoryReviewsService,
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

  async findOne(id: Story['id']) {
    const result = await this.prisma.story.findUnique({
      where: { id: Number(id) },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        humanBook: true,
        cover: true,
      },
    });

    const storyReview = await this.storyReviewService.getReviewsOverview(id);

    return {
      ...result,
      storyReview,
      topics: result?.topics.map((nestedTopic) => nestedTopic.topic),
    };
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
          story: 'storyNotFound',
        },
      });
    }

    return story;
  }
}
