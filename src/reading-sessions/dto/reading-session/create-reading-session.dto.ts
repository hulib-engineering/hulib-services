import { IsString, IsOptional, IsEnum, IsDate, IsInt } from 'class-validator';
import { ReadingSessionStatus } from '../../entities/reading-session.entity';

export class CreateReadingSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReadingSessionStatus)
  sessionStatus: ReadingSessionStatus;

  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @IsInt()
  hostId: number;
}
