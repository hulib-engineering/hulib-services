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
          humanBookTopic: {
            some: {
              topicId: filterOptions?.sharingTopic
                ? { equals: filterOptions?.sharingTopic }
                : { in: filterOptions?.userTopicsOfInterest ?? [] },
            },
          },
        },
        orderBy:
          sortOptions &&
          sortOptions.map((sortOption) => ({
            [sortOption.sortBy]: sortOption.order,
          })),
        include: {
          humanBookTopic: true,
        },
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
      }),
      this.prisma.user.count({
        where: {
          roleId: RoleEnum.humanBook,
          humanBookTopic: {
            some: {
              topicId: filterOptions?.sharingTopic
                ? { equals: filterOptions?.sharingTopic }
                : { in: filterOptions?.userTopicsOfInterest ?? [] },
            },
          },
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
