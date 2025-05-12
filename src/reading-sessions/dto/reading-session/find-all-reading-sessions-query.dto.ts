import {
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReadingSessionStatus } from '../../infrastructure/persistence/relational/entities/reading-session.entity';
import { ApiProperty } from '@nestjs/swagger';

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
  storyId?: number;

  @IsOptional()
  @IsEnum(ReadingSessionStatus)
  sessionStatus?: ReadingSessionStatus;

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
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number = 0;
}
