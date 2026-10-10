import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReadingSessionStatus } from '../../domain';

export const DEFAULT_READING_SESSIONS_LIMIT = 12;
export const DEFAULT_READING_SESSIONS_OFFSET = 0;
export const DEFAULT_READING_SESSIONS_PAGE = 1;

export enum ReadingSessionTimeFrame {
  NOW = 'now',
  UPCOMING = 'upcoming',
  PAST = 'past',
}

export class FindAllReadingSessionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  humanBookId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  storyId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter reading sessions by their statuses',
    default: [ReadingSessionStatus.PENDING, ReadingSessionStatus.APPROVED],
    isArray: true,
    enum: ReadingSessionStatus,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReadingSessionStatus, { each: true })
  @Transform(({ value }) => {
    // Accepts a repeated param (`?sessionStatuses=pending&sessionStatuses=approved`),
    // a single value, or a comma-separated list, since clients differ on which
    // they send for a multi-select.
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        typeof item === 'string' ? item.split(',').map((s) => s.trim()) : item,
      );
    }
    return value;
  })
  sessionStatuses?: ReadingSessionStatus[];

  @ApiProperty({
    required: false,
    description:
      'Filter by the time window the session sits in, relative to now. Composes with `sessionStatuses` — e.g. `sessionStatuses=approved&timeFrame=now` is the "Right now" filter.',
    enum: ReadingSessionTimeFrame,
    example: ReadingSessionTimeFrame.NOW,
  })
  @IsOptional()
  @IsEnum(ReadingSessionTimeFrame)
  timeFrame?: ReadingSessionTimeFrame;

  @ApiProperty({
    required: false,
    description:
      'Deprecated alias for `timeFrame=upcoming`. Prefer `timeFrame`; this will be removed once clients have migrated.',
    default: false,
    deprecated: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  upcoming?: boolean;

  @ApiProperty({
    required: false,
    description: 'startedAt date (must be a valid ISO 8601 date string)',
    default: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(),
  })
  @IsOptional()
  @IsDateString({ strict: true })
  startedAt?: string;

  @ApiProperty({
    required: false,
    description: 'endedAt date (must be a valid ISO 8601 date string)',
    default: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
  })
  @IsOptional()
  @IsDateString({ strict: true })
  endedAt?: string;

  @ApiProperty({
    required: false,
    description: 'Number of sessions per page',
    default: DEFAULT_READING_SESSIONS_LIMIT,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    required: false,
    description:
      'Zero-based row offset. Takes precedence over `page` when both are sent.',
    default: DEFAULT_READING_SESSIONS_OFFSET,
    minimum: 0,
    deprecated: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiProperty({
    required: false,
    description: 'One-based page number. Ignored when `offset` is sent.',
    default: DEFAULT_READING_SESSIONS_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
}
