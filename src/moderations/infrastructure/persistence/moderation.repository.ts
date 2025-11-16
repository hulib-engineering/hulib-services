import {
  Moderation,
  ModerationActionType,
} from '@moderations/domain/moderation';
import { Report } from '@reports/domain/report';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FindOptionsWhere } from 'typeorm';
import { ModerationEntity } from './relational/entities/moderation.entity';

export abstract class ModerationRepository {
  // Report operations
  abstract findReportById(id: Report['id']): Promise<NullableType<Report>>;

  // Moderation CRUD operations
  abstract create(data: {
    userId: number;
    actionType: ModerationActionType;
    reportId?: number;
  }): Promise<Moderation>;

  abstract findById(id: number): Promise<Moderation | null>;

  abstract find(options: {
    where:
      | FindOptionsWhere<ModerationEntity>
      | FindOptionsWhere<ModerationEntity>[];
    relations?: string[];
    order?: { [P in keyof ModerationEntity]?: 'ASC' | 'DESC' };
    skip?: number;
    take?: number;
  }): Promise<Moderation[]>;

  abstract findManyWithPagination(options: {
    filterOptions?: {
      userId?: number;
      actionType?: ModerationActionType;
      status?: string;
      reportId?: number;
    };
    paginationOptions?: IPaginationOptions;
  }): Promise<Moderation[]>;

  abstract update(
    id: Moderation['id'],
    payload: Partial<Moderation>,
  ): Promise<Moderation>;

  abstract remove(id: Moderation['id']): Promise<void>;
}
