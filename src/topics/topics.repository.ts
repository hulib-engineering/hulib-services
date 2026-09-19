import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { DeepPartial } from '@utils/types/deep-partial.type';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Topics } from './domain/topics';
import { TopicColor } from './topic-color.enum';
import { TopicStatus } from './topic-status.enum';
import { PublishStatus } from '@stories/status.enum';

function toDomain(
  raw: Prisma.topicsGetPayload<Record<string, never>>,
): Topics {
  const domain = new Topics();
  domain.id = raw.id;
  domain.name = raw.name;
  domain.color = raw.color as unknown as Topics['color'];
  domain.status = raw.status as unknown as Topics['status'];
  domain.createdAt = raw.createdAt;
  domain.updatedAt = raw.updatedAt;
  return domain;
}

@Injectable()
export class TopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Topics, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Topics> {
    const created = await this.prisma.topics.create({
      data: {
        name: data.name,
        color: (data.color ??
          TopicColor.primary) as unknown as Prisma.topicsUncheckedCreateInput['color'],
        status: (data.status ??
          TopicStatus.inactive) as unknown as Prisma.topicsUncheckedCreateInput['status'],
      },
    });
    return toDomain(created);
  }

  async findAllWithPagination({
    paginationOptions,
    name,
    status,
  }: {
    paginationOptions: IPaginationOptions;
    name?: string;
    status?: Topics['status'];
  }): Promise<{ data: Topics[]; total: number }> {
    const where: Prisma.topicsWhereInput = {};

    if (name) {
      // Case-sensitive substring match — mirrors the previous TypeORM
      // `Like('%name%')`, which was case-sensitive (unlike findByName below).
      where.name = { contains: name };
    }
    if (status) {
      where.status = status as unknown as Prisma.topicsWhereInput['status'];
    }

    const [rows, total] = await Promise.all([
      this.prisma.topics.findMany({
        where,
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
      }),
      this.prisma.topics.count({ where }),
    ]);

    return {
      data: rows.map((row) => toDomain(row)),
      total,
    };
  }

  // Ranks active topics by total reading-session bookings across their
  // published stories — mirrors the previous TypeORM QueryBuilder join.
  async findTop3PopularTopics(): Promise<Topics[]> {
    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT t.id AS "id"
      FROM "topics" t
      LEFT JOIN "storyTopic" st ON st."topicId" = t.id
      LEFT JOIN "story" s ON s.id = st."storyId" AND s."publishStatus" = ${PublishStatus.published}
      LEFT JOIN "readingSession" rs ON rs."storyId" = s.id
      WHERE t.status = ${TopicStatus.active}::"TopicStatus"
      GROUP BY t.id
      ORDER BY COUNT(rs.id) DESC
      LIMIT 3
    `;

    const topicIds = rows.map((row) => row.id).filter(Boolean);
    if (!topicIds.length) {
      return [];
    }

    return this.findByIds(topicIds);
  }

  async findById(id: Topics['id']): Promise<NullableType<Topics>> {
    const found = await this.prisma.topics.findUnique({
      where: { id: Number(id) },
    });
    return found ? toDomain(found) : null;
  }

  async findByName(
    name: string,
    excludeId?: Topics['id'],
  ): Promise<NullableType<Topics>> {
    const trimmedName = name.trim();
    const found = await this.prisma.topics.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        ...(excludeId !== undefined ? { id: { not: Number(excludeId) } } : {}),
      },
    });
    return found ? toDomain(found) : null;
  }

  async update(
    id: Topics['id'],
    payload: DeepPartial<Topics>,
  ): Promise<Topics> {
    const updated = await this.prisma.topics.update({
      where: { id: Number(id) },
      data: {
        name: payload.name,
        color:
          payload.color as unknown as Prisma.topicsUncheckedUpdateInput['color'],
        status:
          payload.status as unknown as Prisma.topicsUncheckedUpdateInput['status'],
      },
    });
    return toDomain(updated);
  }

  async remove(id: Topics['id']): Promise<void> {
    await this.prisma.topics.delete({ where: { id: Number(id) } });
  }

  async findByIds(ids: Topics['id'][]): Promise<Topics[]> {
    const rows = await this.prisma.topics.findMany({
      where: { id: { in: ids.map(Number) } },
    });
    return rows.map((row) => toDomain(row));
  }
}