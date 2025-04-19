import { DeepPartial } from '@utils/types/deep-partial.type';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';

import { Huber } from '../../domain/huber';

export abstract class HuberRepository {
  abstract create(
    data: Omit<Huber, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Huber>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Huber[]>;

  abstract findById(id: Huber['id']): Promise<NullableType<Huber>>;

  abstract update(
    id: Huber['id'],
    payload: DeepPartial<Huber>,
  ): Promise<Huber | null>;

  abstract remove(id: Huber['id']): Promise<void>;
}
