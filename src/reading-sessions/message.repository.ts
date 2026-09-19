import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Message } from './domain/message';

type MessageRecord = Prisma.messageGetPayload<Record<string, never>>;

export function messageToDomain(raw: MessageRecord): Message {
  const domain = new Message();
  domain.id = raw.id;
  domain.readingSessionId = raw.readingSessionId;
  domain.humanBookId = raw.humanBookId;
  domain.readerId = raw.readerId;
  domain.content = raw.content;
  domain.createdAt = raw.createdAt;
  domain.updatedAt = raw.updatedAt;
  domain.deletedAt = raw.deletedAt ?? undefined;
  return domain;
}

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
    return messageToDomain(created);
  }

  async findById(id: number): Promise<Message | null> {
    const found = await this.prisma.message.findUnique({ where: { id } });
    return found ? messageToDomain(found) : null;
  }

  async findByReadingSessionId(readingSessionId: number): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: { readingSessionId },
    });
    return rows.map((row) => messageToDomain(row));
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
    return rows.map((row) => messageToDomain(row));
  }

  async update(id: number, domain: Partial<Message>): Promise<Message> {
    const updated = await this.prisma.message.update({
      where: { id },
      data: {
        content: domain.content,
      },
    });
    return messageToDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
