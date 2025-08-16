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
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  sessionStatuses?: ReadingSessionStatus[];

  @ApiProperty({
    required: false,
    description: 'Get upcoming reading sessions',
    default: false,
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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number;
}
