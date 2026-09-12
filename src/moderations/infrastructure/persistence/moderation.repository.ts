import {
  Moderation,
  ModerationActionType,
  ModerationStatus,
} from '@moderations/domain/moderation';
import { Report } from '@reports/domain/report';
import { NullableType } from '@utils/types/nullable.type';

export interface ModerationFindWhere {
  userId?: number;
  actionType?: ModerationActionType;
  status?: ModerationStatus;
}

export abstract class ModerationRepository {
  // Report operations — only the scalar fields moderations itself reads
  // (reportedUserId, markAsResolved), not a full Report with user relations.
  abstract findReportById(id: Report['id']): Promise<NullableType<Report>>;

  // Moderation CRUD operations
  abstract create(data: {
    userId: number;
    actionType: ModerationActionType;
    reportId?: number;
  }): Promise<Moderation>;

  abstract findById(id: number): Promise<Moderation | null>;

  abstract find(options: {
    where: ModerationFindWhere;
    order?: { createdAt?: 'asc' | 'desc' };
    skip?: number;
    take?: number;
  }): Promise<Moderation[]>;

  abstract update(
    id: Moderation['id'],
    payload: Partial<Moderation>,
  ): Promise<Moderation>;

  abstract remove(id: Moderation['id']): Promise<void>;
}
