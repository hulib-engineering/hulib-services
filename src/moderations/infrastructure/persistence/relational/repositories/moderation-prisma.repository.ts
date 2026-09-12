import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { Report } from '@reports/domain/report';

import {
  ModerationFindWhere,
  ModerationRepository,
} from '@moderations/infrastructure/persistence/moderation.repository';
import {
  Moderation,
  ModerationActionType,
} from '@moderations/domain/moderation';
import { ModerationMapperImplement } from '../mappers/moderation-mapper.implement';

// Only the scalar fields ModerationsService actually reads off a report
// (reportedUserId, markAsResolved) — not a full Report with reporter/
// reportedUser relations, which nothing here needs.
function reportToDomain(raw: {
  id: number;
  reason: string;
  customReason: string | null;
  rejectedReason: string | null;
  rejectedCustomReason: string | null;
  markAsResolved: boolean;
  reporterId: number;
  reportedUserId: number;
  createdAt: Date;
}): Report {
  const domain = new Report();
  domain.id = raw.id;
  domain.reason = raw.reason;
  domain.customReason = raw.customReason;
  domain.rejectedReason = raw.rejectedReason;
  domain.rejectedCustomReason = raw.rejectedCustomReason;
  domain.markAsResolved = raw.markAsResolved;
  domain.reporterId = raw.reporterId;
  domain.reportedUserId = raw.reportedUserId;
  domain.createdAt = raw.createdAt;
  return domain;
}

@Injectable()
export class ModerationRepositoryImplement implements ModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findReportById(id: Report['id']): Promise<NullableType<Report>> {
    const found = await this.prisma.report.findUnique({
      where: { id: Number(id) },
    });
    return found ? reportToDomain(found) : null;
  }

  async create(data: {
    userId: number;
    actionType: ModerationActionType;
    reportId?: number;
  }): Promise<Moderation> {
    const created = await this.prisma.moderation.create({
      data: {
        userId: data.userId,
        actionType:
          data.actionType as unknown as Prisma.moderationUncheckedCreateInput['actionType'],
        reportId: data.reportId,
      },
    });
    return ModerationMapperImplement.toDomain(created);
  }

  async findById(id: number): Promise<Moderation | null> {
    const found = await this.prisma.moderation.findUnique({
      where: { id },
    });
    return found ? ModerationMapperImplement.toDomain(found) : null;
  }

  async find(options: {
    where: ModerationFindWhere;
    order?: { createdAt?: 'asc' | 'desc' };
    skip?: number;
    take?: number;
  }): Promise<Moderation[]> {
    const rows = await this.prisma.moderation.findMany({
      where: options.where as Prisma.moderationWhereInput,
      orderBy: options.order,
      skip: options.skip,
      take: options.take,
    });
    return rows.map((row) => ModerationMapperImplement.toDomain(row));
  }

  async update(
    id: Moderation['id'],
    payload: Partial<Moderation>,
  ): Promise<Moderation> {
    const updated = await this.prisma.moderation.update({
      where: { id: Number(id) },
      data: {
        actionType:
          payload.actionType as unknown as Prisma.moderationUncheckedUpdateInput['actionType'],
        status:
          payload.status as unknown as Prisma.moderationUncheckedUpdateInput['status'],
        reportId: payload.reportId,
      },
    });
    return ModerationMapperImplement.toDomain(updated);
  }

  async remove(id: Moderation['id']): Promise<void> {
    await this.prisma.moderation.delete({ where: { id: Number(id) } });
  }
}
