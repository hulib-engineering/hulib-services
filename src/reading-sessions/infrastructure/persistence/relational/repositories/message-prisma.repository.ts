import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Message } from '@reading-sessions/domain/message';

import { MessageMapperImplement } from '../mappers/message-mapper.implement';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(domain: Message): Promise<Message> {
    const created = await this.prisma.message.create({
      data: {
        readingSessionId: domain.readingSessionId,
        humanBookId: domain.humanBookId,
        readerId: domain.readerId,
        content: domain.content,
      },
    });
    return MessageMapperImplement.toDomain(created);
  }

  async findById(id: number): Promise<Message | null> {
    const found = await this.prisma.message.findUnique({ where: { id } });
    return found ? MessageMapperImplement.toDomain(found) : null;
  }

  async findByReadingSessionId(readingSessionId: number): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: { readingSessionId },
    });
    return rows.map((row) => MessageMapperImplement.toDomain(row));
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: {
      readingSessionId?: number;
      humanBookId?: number;
      readerId?: number;
    };
    paginationOptions: IPaginationOptions;
  }): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: {
        readingSessionId: filterOptions?.readingSessionId,
        humanBookId: filterOptions?.humanBookId,
        readerId: filterOptions?.readerId,
      },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
    return rows.map((row) => MessageMapperImplement.toDomain(row));
  }

  async update(id: number, domain: Partial<Message>): Promise<Message> {
    const updated = await this.prisma.message.update({
      where: { id },
      data: {
        content: domain.content,
      },
    });
    return MessageMapperImplement.toDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
