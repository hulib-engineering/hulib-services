import { BadRequestException, Injectable } from '@nestjs/common';

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

import { HuberWithRelations } from './dto/query-hubers-response.dto';

@Injectable()
export class HubersService {
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
      paged.map(async ({ huber, rating }) => ({
        ...huber,
        feedbackTos: undefined,
        rating,
        file: await this.transformFileUrl(huber.file),
        sharingTopics: huber.humanBookTopic.map((topic) => ({
          ...topic.topic,
        })),
      })),
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
