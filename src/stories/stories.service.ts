import {
  BadRequestException,
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
import { FileDto } from '@files/dto/file.dto';
import fileConfig from '@files/config/file.config';
import { FileConfig, FileDriver } from '@files/config/file-config.type';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileType } from '@files/domain/file';
import { StoryQueryTypeEnum } from '@stories/story-query-type.enum';
import { omit } from 'lodash';
import { Prisma } from '@prisma/client';

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
        topics.map((t: Topic) => t.id),
      );
    }

    const newStory = await this.storiesRepository.create({
      ...createStoriesDto,
      publishStatus:
        createStoriesDto.publishStatus ?? PublishStatus[PublishStatus.pending],
      humanBook,
      topics: topicsEntities,
    });

    const adminId = await this.notifsService.getAdminId();
    if (adminId) {
      await this.notifsService.pushNoti({
        senderId: Number(humanBook.id),
        recipientId: adminId,
        type: NotificationTypeEnum.publishStory,
        relatedEntityId: newStory.id,
      });
    }

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
        createStoriesDto.topics.map((t: Topic) => t.id),
      );
    }
    const newStory = await this.storiesRepository.create({
      ...createStoriesDto,
      publishStatus:
        createStoriesDto.publishStatus ?? PublishStatus[PublishStatus.pending],
      humanBook: user,
      topics: topicsEntities,
    });

    const adminId = await this.notifsService.getAdminId();

    if (adminId) {
      await this.notifsService.pushNoti({
        senderId: Number(userId),
        recipientId: adminId,
        type: NotificationTypeEnum.account,
      });
    }

    return newStory;
  }

  async findAllWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
    currentUserId,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
    currentUserId?: User['id'];
  }) {
    let result: Story[];
    if (
      filterOptions &&
      filterOptions.type === StoryQueryTypeEnum.MOST_POPULAR
    ) {
      result = await this.storiesRepository.findMostPopularWithPagination({
        paginationOptions: {
          page: paginationOptions.page,
          limit: paginationOptions.limit,
        },
      });
    } else {
      result = await this.storiesRepository.findAllWithPagination({
        paginationOptions,
        filterOptions,
        sortOptions,
        currentUserId: currentUserId ? Number(currentUserId) : undefined,
      });
    }

    return await Promise.all(
      (await this.attachStoryStats(result)).map(async (story) => {
        const storyReview = await this.storyReviewService.getReviewsOverview(
          story.id,
        );

        return {
          ...story,
          cover: await this.transformFileUrl(story.cover),
          storyReview,
        };
      }),
    );
  }

  async findAllWithCountAndPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
  }) {
    const result = await this.storiesRepository.findAllWithCountAndPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      filterOptions,
      sortOptions,
    });

    return {
      data: await Promise.all(
        (await this.attachStoryStats(result?.data ?? [])).map(async (story) => {
          const storyReview = await this.storyReviewService.getReviewsOverview(
            story.id,
          );

          return {
            ...story,
            cover: await this.transformFileUrl(story.cover),
            storyReview,
          };
        }),
      ),
      count: result?.count,
    };
  }

  async findOne(id: Story['id'], incrementView = true) {
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
        _count: {
          select: {
            storyFavorite: true,
          },
        },
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
      ? await this.transformFileUrl(result.cover)
      : null;

    const storyReview = await this.storyReviewService.getReviewsOverview(id);
    const [storyCounterRecord] = await this.prisma.$queryRaw<
      { shareCount: number; likeCount: number }[]
    >`
      SELECT "shareCount", "likeCount"
      FROM "story"
      WHERE "id" = ${Number(id)}
    `;
    const viewCount = incrementView
      ? (
          await this.prisma.story.update({
            where: { id: Number(id) },
            data: {
              viewCount: {
                increment: 1,
              },
            },
            select: {
              viewCount: true,
            },
          })
        ).viewCount
      : result.viewCount;

    const humanBookCount = result.humanBook._count;
    const humanBookWithoutFeedback = omit(result.humanBook, [
      'feedbackTos',
      '_count',
    ]);

    const storyCount = result._count;
    const storyWithoutInternalCount = omit(result, [
      '_count',
      'viewCount',
      'shareCount',
      'likeCount',
    ]);

    return {
      ...storyWithoutInternalCount,
      storyReview,
      viewCount,
      shareCount: Number(storyCounterRecord?.shareCount ?? 0),
      likeCount: Number(storyCounterRecord?.likeCount ?? 0),
      totalLikes: storyCount.storyFavorite,
      topics: result.topics?.map((nestedTopic) => nestedTopic.topic) || [],
      cover: coverWithUrl,
      humanBook: {
        ...humanBookWithoutFeedback,
        countTopics: humanBookCount.humanBookTopic,
        rating: humanBookRating,
      },
    };
  }

  async update(
    id: Story['id'],
    updateStoriesDto: UpdateStoryDto,
    // currentUser?: User,
  ) {
    const story = await this.findOne(id, false);

    if (!story) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          story: 'storyNotFound',
        },
      });
    }

    // if (
    //   currentUser?.role?.id !== RoleEnum.admin &&
    //   Number(story.humanBookId) !== Number(currentUser?.id)
    // ) {
    //   throw new ForbiddenException({
    //     status: HttpStatus.FORBIDDEN,
    //     errors: {
    //       story: 'onlyOwnerCanUpdateStory',
    //     },
    //   });
    // }

    let topicsEntities: Topic[] = [];
    if (updateStoriesDto.topics) {
      topicsEntities = await this.topicsRepository.findByIds(
        updateStoriesDto.topics.map((t: Topic) => t.id),
      );
    }

    const updated = await this.storiesRepository.update(id, {
      ...updateStoriesDto,
      ...(topicsEntities.length > 0 ? { topics: topicsEntities } : {}),
    });

    if (
      !!updateStoriesDto.publishStatus &&
      updateStoriesDto.publishStatus === 'published'
    ) {
      const adminId = await this.notifsService.getAdminId();
      if (adminId) {
        await this.notifsService.pushNoti({
          senderId: adminId,
          recipientId: Number(story.humanBookId),
          type: NotificationTypeEnum.publishStory,
          relatedEntityId: story.id,
        });
      }

      await this.prisma.$executeRaw`
        UPDATE "user"
        SET "roleId" = 2,
            "approval" = 'Approved',
            "huberSince" = COALESCE("huberSince", CURRENT_TIMESTAMP)
        WHERE "id" = ${Number(story.humanBookId)}
      `;
    }

    if (
      !!updateStoriesDto.publishStatus &&
      updateStoriesDto.publishStatus === 'rejected'
    ) {
      const adminId = await this.notifsService.getAdminId();
      if (adminId) {
        await this.notifsService.pushNoti({
          senderId: adminId,
          recipientId: Number(story.humanBookId),
          type: NotificationTypeEnum.rejectStory,
          relatedEntityId: story.id,
        });
      }
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

  async getTopics(storyId: number) {
    const topics = await this.storiesRepository.findRelatedTopics(storyId);
    if (!topics) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { story: 'storyNotFound' },
      });
    }
    return topics;
  }

  async share(id: Story['id']) {
    const [updatedStory] = await this.prisma.$queryRaw<
      { id: number; shareCount: number }[]
    >`
      UPDATE "story"
      SET "shareCount" = "shareCount" + 1,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${Number(id)}
        AND "publishStatus" <> ${PublishStatus.deleted}
      RETURNING "id", "shareCount"
    `;

    if (!updatedStory) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          story: 'storyNotFound',
        },
      });
    }

    return {
      id: updatedStory.id,
      shareCount: Number(updatedStory.shareCount),
    };
  }

  async like(id: Story['id']) {
    const [updatedStory] = await this.prisma.$queryRaw<
      { id: number; likeCount: number }[]
    >`
      UPDATE "story"
      SET "likeCount" = "likeCount" + 1,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${Number(id)}
        AND "publishStatus" <> ${PublishStatus.deleted}
      RETURNING "id", "likeCount"
    `;

    if (!updatedStory) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          story: 'storyNotFound',
        },
      });
    }

    return {
      id: updatedStory.id,
      likeCount: Number(updatedStory.likeCount),
    };
  }

  // For Prisma pipe only
  private async transformFileUrl(
    file?: FileType | null,
  ): Promise<FileDto | null | undefined> {
    if (!file) return file;

    const config = fileConfig() as FileConfig;

    if (config.driver === FileDriver.LOCAL) {
      file.path = (appConfig() as AppConfig).backendDomain + file.path;
    } else if (
      [FileDriver.S3, FileDriver.S3_PRESIGNED].includes(config.driver)
    ) {
      if (!file.path) {
        throw new BadRequestException('Missing file path for S3 object.');
      }

      const s3 = new S3Client({
        region: config.awsS3Region ?? '',
        credentials: {
          accessKeyId: config.accessKeyId ?? '',
          secretAccessKey: config.secretAccessKey ?? '',
        },
      });

      const command = new GetObjectCommand({
        Bucket: config.awsDefaultS3Bucket,
        Key: file.path,
      });

      file.path = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    return file;
  }

  private async attachStoryStats(stories: Story[]): Promise<Story[]> {
    const storyIds = stories.map((story) => story.id);
    if (!storyIds.length) return stories;

    const storyStats = await this.prisma.story.findMany({
      where: {
        id: {
          in: storyIds,
        },
      },
      select: {
        id: true,
        viewCount: true,
        _count: {
          select: {
            storyFavorite: true,
          },
        },
      },
    });

    const viewCountByStoryId = new Map(
      storyStats.map((item) => [item.id, item.viewCount]),
    );
    const totalLikesByStoryId = new Map(
      storyStats.map((item) => [item.id, item._count.storyFavorite]),
    );
    const storyCounterRows = await this.prisma.$queryRaw<
      { id: number; shareCount: number; likeCount: number }[]
    >`
      SELECT "id", "shareCount", "likeCount"
      FROM "story"
      WHERE "id" IN (${Prisma.join(storyIds)})
    `;
    const shareCountByStoryId = new Map(
      storyCounterRows.map((item) => [item.id, item.shareCount]),
    );
    const likeCountByStoryId = new Map(
      storyCounterRows.map((item) => [item.id, item.likeCount]),
    );

    return stories.map((story) => {
      const storyWithoutInternalCount = omit(story, [
        'viewCount',
        'shareCount',
        'likeCount',
      ]);

      return {
        ...storyWithoutInternalCount,
        viewCount: Number(viewCountByStoryId.get(story.id) ?? 0),
        shareCount: Number(shareCountByStoryId.get(story.id) ?? 0),
        likeCount: Number(likeCountByStoryId.get(story.id) ?? 0),
        totalLikes: Number(totalLikesByStoryId.get(story.id) ?? 0),
      };
    });
  }
}
