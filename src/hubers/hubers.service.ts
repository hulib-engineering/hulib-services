import { BadRequestException, Injectable } from '@nestjs/common';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FilterUserDto } from '@users/dto/query-user.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { ISortOptions } from '@utils/types/sort-options';
import { Huber } from './domain/huber';
import { PublishStatus } from '../stories/status.enum';
import { FileType } from '@files/domain/file';
import { FileDto } from '@files/dto/file.dto';
import fileConfig from '@files/config/file.config';
import { FileConfig, FileDriver } from '@files/config/file-config.type';
import appConfig from '@config/app.config';
import { AppConfig } from '@config/app-config.type';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { omit } from 'lodash';
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
    const [hubers, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          roleId: RoleEnum.humanBook,
          humanBookTopic:
            (filterOptions?.sharingTopics &&
              filterOptions?.sharingTopics.length &&
              filterOptions?.sharingTopics.length > 0) ||
            (filterOptions?.userTopicsOfInterest &&
              filterOptions?.userTopicsOfInterest.length &&
              filterOptions?.userTopicsOfInterest.length > 0)
              ? {
                  some: {
                    topicId:
                      filterOptions?.sharingTopics &&
                      filterOptions?.sharingTopics?.length > 0
                        ? { in: filterOptions?.sharingTopics }
                        : { in: filterOptions?.userTopicsOfInterest },
                  },
                }
              : undefined,
        },
        orderBy:
          sortOptions &&
          sortOptions.map((sortOption) => ({
            [sortOption.sortBy]: sortOption.order,
          })),
        include: {
          humanBookTopic: {
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
        },
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
      }),
      this.prisma.user.count({
        where: {
          roleId: RoleEnum.humanBook,
          humanBookTopic:
            (filterOptions?.sharingTopics &&
              filterOptions?.sharingTopics.length &&
              filterOptions?.sharingTopics.length > 0) ||
            (filterOptions?.userTopicsOfInterest &&
              filterOptions?.userTopicsOfInterest.length &&
              filterOptions?.userTopicsOfInterest.length > 0)
              ? {
                  some: {
                    topicId:
                      filterOptions?.sharingTopics &&
                      filterOptions?.sharingTopics?.length > 0
                        ? { in: filterOptions?.sharingTopics }
                        : { in: filterOptions?.userTopicsOfInterest },
                  },
                }
              : undefined,
        },
      }),
    ]);

    return [
      await Promise.all(
        hubers.map(async (huber) => ({
          ...huber,
          file: await this.transformFileUrl(huber.file),
          sharingTopics: huber.humanBookTopic.map((topic) => ({
            ...topic.topic,
          })),
        })),
      ),
      count,
    ];
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
    // 1️⃣ Fetch hubers with optional topic filters and include related files and topics
    const hubers = await this.prisma.user.findMany({
      where: {
        roleId: RoleEnum.humanBook,
        humanBookTopic: filterOptions?.userTopicsOfInterest?.length
          ? {
              some: {
                topicId: { in: filterOptions.userTopicsOfInterest },
              },
            }
          : undefined,
      },
      include: {
        humanBookTopic: true,
        file: {
          select: {
            id: true,
            path: true,
          },
        },
        feedbackBys: true,
        feedbackTos: true, // 👈 fetch feedback given to the huber
      },
    });

    // 2️⃣ Calculate huber rating from feedback
    const hubersWithRating = await Promise.all(
      hubers.map(async (huber) => {
        const allFeedback = huber.feedbackTos ?? [];
        const avgRating =
          allFeedback.length > 0
            ? allFeedback.reduce((acc, f) => acc + f.rating, 0) /
              allFeedback.length
            : 0;

        const rating = Math.round(avgRating * 10) / 10; // 👉 round to 1 decimal

        return {
          ...omit(huber, ['feedbackTos', 'feedbackBys']),
          file: await this.transformFileUrl(huber.file),
          rating,
        };
      }),
    );

    // 3️⃣ Sort by rating descending
    hubersWithRating.sort((a, b) => b.rating - a.rating);

    // 4️⃣ Pagination
    const totalCount = hubersWithRating.length;
    const start = (paginationOptions.page - 1) * paginationOptions.limit;
    const end = start + paginationOptions.limit;
    const pagedHubers = hubersWithRating.slice(start, end);

    return [pagedHubers, totalCount];
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
