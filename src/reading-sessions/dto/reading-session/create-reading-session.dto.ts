import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ReadingSessionStatus } from '../../entities/reading-session.entity';

export class CreateReadingSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReadingSessionStatus)
  sessionStatus: ReadingSessionStatus;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;
}
