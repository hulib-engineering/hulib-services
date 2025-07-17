import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FilterUserDto } from '@users/dto/query-user.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { ISortOptions } from '@utils/types/sort-options';
import { Huber } from './domain/huber';
import { PublishStatus } from '../stories/status.enum';

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

  async getStories(id: Huber['id']) {
    const stories = await this.prisma.story.findMany({
      where: {
        humanBookId: id,
        publishStatus: {
          not: PublishStatus.deleted,
        },
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
      },
    });
    const customStories = stories.map((item) => {
      const numOfReview = item.storyReview.length;
      let rating = 0;
      if (numOfReview > 0) {
        rating =
          item.storyReview.reduce((acc, currentValue) => {
            return acc + currentValue.rating;
          }, 0) / numOfReview;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { storyReview, ...rest } = item;
      return {
        ...rest,
        numOfReview,
        rating,
      };
    });

    return customStories;
  }
}
