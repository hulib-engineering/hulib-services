import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
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
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsDate()
  endTime?: Date;
}
