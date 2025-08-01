import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Report } from '../../domain/report';

export abstract class ReportRepository {
  abstract create(
    data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Report>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Report[]>;

  abstract findById(id: Report['id']): Promise<NullableType<Report>>;

  abstract update(
    id: Report['id'],
    payload: DeepPartial<Report>,
  ): Promise<Report | null>;

  abstract remove(id: Report['id']): Promise<void>;
}
