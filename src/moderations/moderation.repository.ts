import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { Report } from '@reports/domain/report';
import {
  Moderation,
  ModerationActionType,
  ModerationStatus,
} from './domain/moderation';

export interface ModerationFindWhere {
  userId?: number;
  actionType?: ModerationActionType;
  status?: ModerationStatus;
}

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

function toDomain(
  raw: Prisma.moderationGetPayload<Record<string, never>>,
): Moderation {
  const domain = new Moderation();
  domain.id = raw.id;
  domain.actionType = raw.actionType as unknown as Moderation['actionType'];
  domain.status = raw.status as unknown as Moderation['status'];
  domain.userId = raw.userId;
  domain.reportId = raw.reportId;
  domain.createdAt = raw.createdAt;
  domain.updatedAt = raw.updatedAt;
  return domain;
}

@Injectable()
export class ModerationRepository {
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
    return toDomain(created);
  }

  async findById(id: number): Promise<Moderation | null> {
    const found = await this.prisma.moderation.findUnique({
      where: { id },
    });
    return found ? toDomain(found) : null;
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
    return rows.map((row) => toDomain(row));
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
    return toDomain(updated);
  }

  async remove(id: Moderation['id']): Promise<void> {
    await this.prisma.moderation.delete({ where: { id: Number(id) } });
  }
}
