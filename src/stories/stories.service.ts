import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryRepository } from './infrastructure/persistence/story.repository';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Story } from './domain/story';
import { FilterStoryDto, SortStoryDto } from './dto/find-all-stories.dto';
import { PublishStatus } from './status.enum';

import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
import { TopicsRepository } from '@topics/infrastructure/persistence/topics.repository';
import { User } from '@users/domain/user';
import { Topic } from '@topics/domain/topics';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

@Injectable()
export class StoriesService {
  constructor(
    private readonly storiesRepository: StoryRepository,
    private readonly storyReviewService: StoryReviewsService,
    private readonly topicsRepository: TopicsRepository,
    private readonly usersService: UsersService,
    private readonly notifsService: NotificationsService,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
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

    const { topics } = createStoriesDto;
    let topicsEntities: any[] = [];
    if (topics && topics.length > 0) {
      topicsEntities = await this.topicsRepository.findByIds(
        topics.map((t) => t.id),
      );
    }

    return this.storiesRepository.create({
      ...createStoriesDto,
      humanBook,
      topics: topicsEntities,
    });
  }

  async createFirst(userId: User['id'], createStoriesDto: CreateStoryDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.NOT_FOUND,
        errors: {
          email: 'userNotFound',
        },
      });
    }

    let topicsEntities: Topic[] = [];
    if (createStoriesDto.topics && createStoriesDto.topics.length > 0) {
      topicsEntities = await this.topicsRepository.findByIds(
        createStoriesDto.topics.map((t) => t.id),
      );
    }
    const newStory = await this.storiesRepository.create({
      ...createStoriesDto,
      humanBook: user,
      topics: topicsEntities,
    });

    const notification = await this.notifsService.create({
      senderId: Number(userId),
      recipientId: 1,
      type: NotificationTypeEnum.account,
    });

    if (notification) {
      const updatedNotifications =
        await this.notifsService.findAllWithPagination({
          filterOptions: { recipientId: 1 },
          paginationOptions: { page: 1, limit: 5 },
        });

      this.eventEmitter.onAny((event, value) => {
        console.log('[DEBUG] Event fired:', event, value);
      });

      this.eventEmitter.emit('notification.list.fetch', {
        userId: notification.recipientId,
        notifications: updatedNotifications,
      });
    }

    return newStory;
  }

  findAllWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
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

    if (!result || result.publishStatus === PublishStatus.deleted) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          story: 'storyNotFound',
        },
      });
    }

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
    return this.storiesRepository.update(id, {
      publishStatus: PublishStatus[PublishStatus.deleted] as string,
    });
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
