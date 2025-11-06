import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Appeal } from '../../domain/appeal';

export abstract class AppealRepository {
  abstract create(
    data: Omit<Appeal, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Appeal>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Appeal[]>;

  abstract findById(id: Appeal['id']): Promise<NullableType<Appeal>>;

  abstract findByModerationAndUser(
    moderationId: number,
    userId: number,
  ): Promise<NullableType<Appeal>>;

  abstract update(
    id: Appeal['id'],
    payload: DeepPartial<Appeal>,
  ): Promise<Appeal | null>;

  abstract remove(id: Appeal['id']): Promise<void>;
}
