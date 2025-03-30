import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsEnum,
  IsDate,
} from 'class-validator';
import { ReadingSessionStatus } from '../../infrastructure/persistence/relational/entities';
import { FeedbackResponseDto } from './feedback-response.dto';
import { Type } from 'class-transformer';
import { MessageResponseDto } from './message-response.dto';

export class ReadingSessionResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  humanBookId: number;

  @IsNumber()
  readerId: number;

  @IsNumber()
  storyId: number;

  @IsUrl()
  @IsString()
  sessionUrl: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsUrl()
  @IsString()
  recordingUrl?: string;

  @IsEnum(ReadingSessionStatus)
  sessionStatus: ReadingSessionStatus;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsDate()
  startedAt: Date;

  @IsDate()
  endedAt: Date;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @IsOptional()
  @Type(() => FeedbackResponseDto)
  feedbacks?: FeedbackResponseDto[];

  @IsOptional()
  @Type(() => MessageResponseDto)
  messages?: MessageResponseDto[];
}
