import { ApiProperty } from '@nestjs/swagger';
import { ReadingSessionFilterCounts } from '@reading-sessions/reading-session.repository';

export class PaginationResponseDto<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Same envelope as `PaginationResponseDto`, with the per-filter-option counts
// the reading-sessions tab badges render.
export class ReadingSessionPageResponseDto<T> extends PaginationResponseDto<T> {
  @ApiProperty({
    type: Object,
    description: 'Per-filter-option session counts, keyed by filter option',
    example: {
      all: 25,
      approved: 9,
      pending: 6,
      finished: 13,
      missed: 1,
    },
  })
  declare meta: PaginationResponseDto<T>['meta'] & {
    counts: ReadingSessionFilterCounts;
  };
}
