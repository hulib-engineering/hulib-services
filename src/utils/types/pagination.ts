import { IPaginationOptions } from '@utils/types/pagination-options';
import { PaginationResponseDto } from '@utils/dto/pagination-response.dto';

export const pagination = <T>(
  data: T[],
  count: number,
  options: IPaginationOptions,
): PaginationResponseDto<T> => {
  return {
    data,
    meta: {
      totalItems: count,
      itemsPerPage: options.limit,
      totalPages: Math.ceil(count / options.limit),
      currentPage: options.page,
    },
  };
};
