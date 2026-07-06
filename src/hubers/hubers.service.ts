import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IPaginationOptions } from '@utils/types/pagination-options';
import { FilterUserDto } from '@users/dto/query-user.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { ISortOptions } from '@utils/types/sort-options';
import { Huber } from './domain/huber';
import { PublishStatus } from '@stories/status.enum';
import { FileType } from '@files/domain/file';
import { FileDto } from '@files/dto/file.dto';
import fileConfig from '@files/config/file.config';
import { FileConfig, FileDriver } from '@files/config/file-config.type';
import appConfig from '@config/app.config';
import { AppConfig } from '@config/app-config.type';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TopicStatus } from '@topics/topic-status.enum';

import {
  HuberVerificationStatus,
  HuberWithRelations,
} from './dto/query-hubers-response.dto';
import { Approval } from '@users/approval.enum';
import { omit } from 'lodash';

const HUBER_CHALLENGE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class HubersService {
  private readonly logger = new Logger(HubersService.name);

  constructor(private prisma: PrismaService) {}

  async queryHubers({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto;
    sortOptions?: ISortOptions[];
    paginationOptions: IPaginationOptions;
  }): Promise<[HuberWithRelations[], number]> {
    const where = this.buildHubersWhereClause(filterOptions);

    const [hubers, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          humanBookTopic: {
            where: {
              topic: {
                status: TopicStatus.active,
              },
            },
            include: {
              topic: true,
            },
          },
          file: {
            select: {
              id: true,
              path: true,
            },
          },
          feedbackTos: true,
          stories: {
            where: {
              publishStatus: PublishStatus.published,
            },
            select: {
              topics: {
                include: {
                  topic: true,
                },
              },
            },
          },
          _count: {
            select: {
              stories: {
                where: {
                  publishStatus: PublishStatus.published,
                },
              },
              favoritedByUsers: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const hubersWithOnlyFieldsToSort = hubers.map((huber) => ({
      huber,
      ...this.computFieldsToSort(huber),
    }));

    hubersWithOnlyFieldsToSort.sort((left, right) =>
      this.compareHubersByFieldsToSort(left, right, sortOptions),
    );

    const startIndex = (paginationOptions.page - 1) * paginationOptions.limit;
    const paged = hubersWithOnlyFieldsToSort.slice(
      startIndex,
      startIndex + paginationOptions.limit,
    );

    const result = await Promise.all(
      paged.map(async ({ huber, rating }) => {
        const storyTopics = new Map<
          number,
          { id: number; name: string; color: string }
        >();

        for (const story of huber.stories) {
          for (const { topic } of story.topics) {
            storyTopics.set(topic.id, {
              id: topic.id,
              name: topic.name,
              color: topic.color,
            });
          }
        }

        const bookCount = huber._count.stories;
        const challengeEndsAt = huber.huberSince
          ? new Date(huber.huberSince.getTime() + HUBER_CHALLENGE_DURATION_MS)
          : null;
        const huberData = omit(huber, ['stories', '_count', 'feedbackTos']);

        return {
          ...huberData,
          rating,
          file: await this.transformFileUrl(huber.file),
          sharingTopics: huber.humanBookTopic.map((topic) => ({
            ...topic.topic,
          })),
          verificationStatus:
            bookCount > 0
              ? HuberVerificationStatus.verified
              : HuberVerificationStatus.challenge,
          challengeEndsAt: bookCount > 0 ? null : challengeEndsAt,
          storyTopics: Array.from(storyTopics.values()),
          bookCount,
          followerCount: huber._count.favoritedByUsers,
        };
      }),
    );

    return [result as HuberWithRelations[], count];
  }

  findOne(id: Huber['id']) {
    return this.prisma.user.findUnique({
      where: {
        id,
        roleId: RoleEnum.humanBook,
      },
    });
  }

  async getHuberSessions(id: Huber['id']) {
    const huberReadingSessions = await this.prisma.user.findUnique({
      where: { id },
      include: {
        huberReadingSessions: true,
      },
    });

    return huberReadingSessions?.huberReadingSessions;
  }

  async getStories(id: Huber['id'], publishedOnly: boolean = false) {
    const stories = await this.prisma.story.findMany({
      where: {
        humanBookId: id,
        publishStatus: !publishedOnly
          ? {
              not: PublishStatus.deleted,
            }
          : { equals: PublishStatus.published },
      },
      include: {
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
        },
        storyReview: true,
        cover: true,
        topics: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return stories.map(async (item) => {
      const numOfReview = item.storyReview.length;
      let rating = 0;
      if (numOfReview > 0) {
        rating =
          item.storyReview.reduce((acc, currentValue) => {
            return acc + currentValue.rating;
          }, 0) / numOfReview;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { storyReview, cover, topics, publishStatus, ...rest } = item;
      return {
        ...rest,
        numOfReview,
        rating,
        topics: topics.map((topic) => ({
          id: topic.topic.id,
          name: topic.topic.name,
        })),
        cover: await this.transformFileUrl(cover),
        publishStatus: PublishStatus[publishStatus],
      };
    });
  }

  async findRecommendedHubers({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto;
    paginationOptions: IPaginationOptions;
  }): Promise<[HuberWithRelations[], number]> {
    return this.queryHubers({
      filterOptions: {
        userTopicsOfInterest: filterOptions?.userTopicsOfInterest,
      },
      paginationOptions,
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async downgradeExpiredChallengeHubers() {
    const challengeStartedBefore = new Date(
      Date.now() - HUBER_CHALLENGE_DURATION_MS,
    );
    const result = await this.prisma.user.updateMany({
      where: {
        roleId: RoleEnum.humanBook,
        huberSince: {
          lt: challengeStartedBefore,
        },
        stories: {
          none: {
            publishStatus: PublishStatus.published,
          },
        },
      },
      data: {
        roleId: RoleEnum.reader,
        approval: Approval.notRequested,
        huberSince: null,
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Downgraded ${result.count} expired Huber challenge(s) to Liber.`,
      );
    }
  }

  private buildHubersWhereClause(filterOptions?: FilterUserDto) {
    const topicIds =
      filterOptions?.sharingTopics && filterOptions.sharingTopics.length > 0
        ? filterOptions.sharingTopics
        : filterOptions?.userTopicsOfInterest &&
            filterOptions.userTopicsOfInterest.length > 0
          ? filterOptions.userTopicsOfInterest
          : null;

    return {
      roleId: RoleEnum.humanBook,
      humanBookTopic: topicIds
        ? { some: { topicId: { in: topicIds } } }
        : undefined,
    };
  }

  private computFieldsToSort(huber: Record<string, any>) {
    const allFeedback = (huber.feedbackTos as any[]) ?? [];
    const avgRating =
      allFeedback.length > 0
        ? allFeedback.reduce((acc, f) => acc + f.rating, 0) / allFeedback.length
        : 0;
    const rating = Math.round(avgRating * 10) / 10;
    const fullName = huber.fullName ?? '';

    return { rating, fullName };
  }

  private compareHubersByFieldsToSort(
    left: {
      huber: Record<string, any>;
      rating: number;
      fullName: string;
    },
    right: {
      huber: Record<string, any>;
      rating: number;
      fullName: string;
    },
    sortOptions?: ISortOptions[],
  ) {
    for (const sortOption of sortOptions ?? []) {
      const leftValue = (left.huber as any)[sortOption.sortBy];
      const rightValue = (right.huber as any)[sortOption.sortBy];
      const diff = this.compareFieldValues(
        leftValue,
        rightValue,
        sortOption.order,
      );
      if (diff !== 0) return diff;
    }

    const ratingDiff = right.rating - left.rating;
    if (ratingDiff !== 0) return ratingDiff;
    return left.fullName.localeCompare(right.fullName);
  }

  private compareFieldValues(a: unknown, b: unknown, order: 'asc' | 'desc') {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    let diff: number;

    if (typeof a === 'string' && typeof b === 'string') {
      diff = a.localeCompare(b);
    } else if (typeof a === 'number' && typeof b === 'number') {
      diff = a - b;
    } else if (a instanceof Date && b instanceof Date) {
      diff = a.getTime() - b.getTime();
    } else {
      diff = String(a).localeCompare(String(b));
    }

    return order === 'desc' ? -diff : diff;
  }

  // For Prisma pipe only
  private async transformFileUrl(
    file: FileType | null,
  ): Promise<FileDto | null> {
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
}
