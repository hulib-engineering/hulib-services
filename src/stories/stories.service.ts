import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
import { TopicsRepository } from '@topics/infrastructure/persistence/topics.repository';
import { User } from '@users/domain/user';
import { Topic } from '@topics/domain/topics';
import { AppConfig } from '@config/app-config.type';
import appConfig from '@config/app.config';

import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryRepository } from './infrastructure/persistence/story.repository';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Story } from './domain/story';
import { FilterStoryDto, SortStoryDto } from './dto/find-all-stories.dto';
import { PublishStatus } from './status.enum';

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

    const newStory = await this.storiesRepository.create({
      ...createStoriesDto,
      humanBook,
      topics: topicsEntities,
    });

    await this.notifsService.pushNoti({
      senderId: Number(humanBook.id),
      recipientId: 1,
      type: NotificationTypeEnum.publishStory,
      relatedEntityId: newStory.id,
    });

    return newStory;
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

    await this.notifsService.pushNoti({
      senderId: Number(userId),
      recipientId: 1,
      type: NotificationTypeEnum.account,
    });

    return newStory;
  }

  async findAllWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
  }) {
    const result = await this.storiesRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      filterOptions,
      sortOptions,
    });

    const reviews = await this.prisma.storyReview.findMany({
      where: { storyId: { in: result.map((story) => story.id) } },
      select: { storyId: true, rating: true },
    });

    return result.map((story) => {
      const storyReviews = reviews.filter(
        (review) => review.storyId === story.id,
      );
      const avgRating =
        storyReviews.reduce((sum, review) => sum + review.rating, 0) /
        (storyReviews.length || 1);

      return {
        ...story,
        rating: avgRating ? Number(avgRating.toFixed(1)) : 0,
        countReviews: storyReviews?.length || 0,
      };
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
        humanBook: {
          omit: {
            deletedAt: true,
            genderId: true,
            roleId: true,
            statusId: true,
            photoId: true,
            password: true,
            createdAt: true,
            updatedAt: true,
          },
          include: {
            feedbackTos: true,
            _count: {
              select: {
                humanBookTopic: true,
              },
            },
          },
        },
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

    const humanBookRating = Number(
      (
        result.humanBook.feedbackTos.reduce(
          (total, feedback) => total + feedback.rating,
          0,
        ) / result.humanBook.feedbackTos.length
      ).toFixed(1),
    );

    const coverWithUrl = result.cover
      ? {
          id: result.cover.id,
          path: (appConfig() as AppConfig).backendDomain + result.cover.path,
        }
      : null;

    const storyReview = await this.storyReviewService.getReviewsOverview(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { feedbackTos, _count, ...humanBookWithoutFeedback } =
      result.humanBook;

    return {
      ...result,
      storyReview,
      topics: result.topics?.map((nestedTopic) => nestedTopic.topic) || [],
      cover: coverWithUrl,
      humanBook: {
        ...humanBookWithoutFeedback,
        countTopics: result.humanBook._count.humanBookTopic,
        rating: humanBookRating,
      },
    };
  }

  async update(id: Story['id'], updateStoriesDto: UpdateStoryDto) {
    const story = await this.findOne(id);

    if (!story) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          story: 'storyNotFound',
        },
      });
    }

    const updated = await this.storiesRepository.update(id, updateStoriesDto);

    if (
      !!updateStoriesDto.publishStatus &&
      updateStoriesDto.publishStatus === 'published'
    ) {
      await this.notifsService.pushNoti({
        senderId: 1,
        recipientId: story.humanBookId,
        type: NotificationTypeEnum.publishStory,
        relatedEntityId: story.id,
      });
    }

    if (
      !!updateStoriesDto.publishStatus &&
      updateStoriesDto.publishStatus === 'rejected'
    ) {
      await this.notifsService.pushNoti({
        senderId: 1,
        recipientId: story.humanBookId,
        type: NotificationTypeEnum.rejectStory,
        relatedEntityId: story.id,
      });
    }

    return updated;
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
