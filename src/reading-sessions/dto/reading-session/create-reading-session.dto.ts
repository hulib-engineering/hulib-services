import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateReadingSessionDto {
  @IsNumber()
  humanBookId: number;

  @IsNumber()
  readerId: number;

  @IsNumber()
  storyId: number;

  @IsNumber()
  authorScheduleId: number;

  @IsUrl()
  sessionUrl: string;

  @IsOptional()
  @IsString()
  note?: string;
}
