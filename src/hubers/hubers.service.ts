import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FilterUserDto } from '@users/dto/query-user.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { ISortOptions } from '@utils/types/sort-options';

import { Huber } from './domain/huber';

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
}
