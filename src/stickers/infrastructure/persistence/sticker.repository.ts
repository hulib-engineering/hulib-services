import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Sticker } from '../../domain/sticker';

export abstract class StickerRepository {
  abstract create(
    data: Omit<Sticker, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Sticker>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Sticker[]>;

  abstract findById(id: Sticker['id']): Promise<NullableType<Sticker>>;

  abstract update(
    id: Sticker['id'],
    payload: DeepPartial<Sticker>,
  ): Promise<Sticker | null>;

  abstract remove(id: Sticker['id']): Promise<void>;
}
