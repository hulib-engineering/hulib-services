import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PrismaService } from '../prisma-client/prisma-client.service';
import { FindQueryNotificationsDto } from './dto/find-all-notifications-query.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAllWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions: FindQueryNotificationsDto;
    paginationOptions: IPaginationOptions;
  }) {
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;
    return this.prisma.notification.findMany({
      where: {
        ...filterOptions,
      },
      include: {
        type: true,
        recipient: {
          select: {
            id: true,
            fullName: true,
            file: {
              select: {
                path: true,
              },
            },
          },
        },
        sender: {
          select: {
            id: true,
            fullName: true,
            file: {
              select: {
                path: true,
              },
            },
          },
        },
        relatedEntity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      omit: {
        typeId: true,
        recipientId: true,
        senderId: true,
        relatedEntityId: true,
      },
      skip,
      take,
    });
  }
}
