import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ReadingSessionStatus } from '../../entities/reading-session.entity';

export class FindAllReadingSessionsQueryDto {
  @IsOptional()
  @IsNumber()
  humanBookId?: number;

  @IsOptional()
  @IsNumber()
  readerId?: number;

  @IsOptional()
  @IsNumber()
  storyId?: number;

  @IsOptional()
  @IsEnum(ReadingSessionStatus)
  sessionStatus?: ReadingSessionStatus;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
