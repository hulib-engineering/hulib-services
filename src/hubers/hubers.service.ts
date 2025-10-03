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

@Injectable()
export class HubersService {
  constructor(private prisma: PrismaService) {}

  queryHubers({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto;
    sortOptions?: ISortOptions[];
    paginationOptions: IPaginationOptions;
  }) {
    return this.prisma.$transaction([
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
          humanBookTopic: true,
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
