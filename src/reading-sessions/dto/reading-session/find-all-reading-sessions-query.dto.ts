import { IsNumber, IsOptional, IsEnum, Min, IsBoolean } from 'class-validator';
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
