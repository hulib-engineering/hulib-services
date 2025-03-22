import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReadingSessionStatus } from '../../infrastructure/persistence/relational/entities/reading-session.entity';

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
