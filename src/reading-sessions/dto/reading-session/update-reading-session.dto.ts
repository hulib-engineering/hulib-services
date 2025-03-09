import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ReadingSessionStatus } from '../../entities/reading-session.entity';

export class UpdateReadingSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ReadingSessionStatus)
  sessionStatus?: ReadingSessionStatus;

  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
