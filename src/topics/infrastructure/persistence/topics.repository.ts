import { DeepPartial } from '@utils/types/deep-partial.type';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Topics } from '@topics/domain/topics';

export abstract class TopicsRepository {
  abstract create(
    data: Omit<Topics, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Topics>;

  abstract findAllWithPagination({
    paginationOptions,
    name,
  }: {
    paginationOptions: IPaginationOptions;
    name?: string;
  }): Promise<Topics[]>;

  abstract findById(id: Topics['id']): Promise<NullableType<Topics>>;

  abstract update(
    id: Topics['id'],
    payload: DeepPartial<Topics>,
  ): Promise<Topics | null>;

  abstract remove(id: Topics['id']): Promise<void>;

  abstract findByIds(ids: Topics['id'][]): Promise<Topics[]>;
}
