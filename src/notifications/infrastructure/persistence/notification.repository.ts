import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { notification } from '../../domain/notification';

export abstract class notificationRepository {
  abstract create(
    data: Omit<notification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<notification>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<notification[]>;

  abstract findById(
    id: notification['id'],
  ): Promise<NullableType<notification>>;

  abstract update(
    id: notification['id'],
    payload: DeepPartial<notification>,
  ): Promise<notification | null>;

  abstract remove(id: notification['id']): Promise<void>;
}
