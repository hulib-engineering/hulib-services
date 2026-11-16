import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_UPCOMING_READING_SESSIONS_WITHIN_HOURS = 24;
export const DEFAULT_UPCOMING_READING_SESSIONS_LIMIT = 5;
export const MAX_UPCOMING_READING_SESSIONS_WITHIN_HOURS = 168;
export const MAX_UPCOMING_READING_SESSIONS_LIMIT = 50;

export class FindUpcomingReadingSessionsQueryDto {
  @ApiProperty({
    required: false,
    description: 'Only include sessions starting within this many hours',
    default: DEFAULT_UPCOMING_READING_SESSIONS_WITHIN_HOURS,
    minimum: 1,
    maximum: MAX_UPCOMING_READING_SESSIONS_WITHIN_HOURS,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_UPCOMING_READING_SESSIONS_WITHIN_HOURS)
  withinHours?: number;

  @ApiProperty({
    required: false,
    description: 'Maximum number of sessions to return',
    default: DEFAULT_UPCOMING_READING_SESSIONS_LIMIT,
    minimum: 1,
    maximum: MAX_UPCOMING_READING_SESSIONS_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_UPCOMING_READING_SESSIONS_LIMIT)
  limit?: number;
}
