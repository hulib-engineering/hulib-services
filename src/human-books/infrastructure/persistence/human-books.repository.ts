import { User } from '../../../users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { HumanBooks } from '../../domain/human-books';

export abstract class HumanBooksRepository {
  abstract create(
    data: Omit<HumanBooks, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<HumanBooks>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<HumanBooks[]>;

  abstract findById(id: HumanBooks['id']): Promise<NullableType<HumanBooks>>;

  abstract update(
    id: HumanBooks['id'],
    payload: DeepPartial<HumanBooks>,
  ): Promise<HumanBooks | null>;

  abstract remove(id: HumanBooks['id']): Promise<void>;

  abstract findByUserId(userId: User['id']): Promise<NullableType<HumanBooks>>;
}
