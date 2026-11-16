import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsEnum,
  IsDate,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { FeedbackResponseDto } from './feedback-response.dto';
import { Type } from 'class-transformer';
import { MessageResponseDto } from './message-response.dto';
import { ReadingSessionStatus } from '../../domain';

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
  @IsDate()
  feedbackSubmittedAt?: Date | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  feelingRating?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  satisfactionRating?: number | null;

  @IsOptional()
  @IsString()
  sessionContent?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  huberRating?: number | null;

  @IsOptional()
  @IsString()
  huberContent?: string | null;

  @IsOptional()
  @IsBoolean()
  huberFeedbackSkipped?: boolean;

  @IsOptional()
  @Type(() => FeedbackResponseDto)
  feedbacks?: FeedbackResponseDto[];

  @IsOptional()
  @Type(() => MessageResponseDto)
  messages?: MessageResponseDto[];
}

export type ReadingSessionResponseDtoWithRelations = Omit<
  ReadingSessionResponseDto,
  | 'humanBookId'
  | 'readerId'
  | 'storyId'
  | 'humanBook.gender.__entity'
  | 'humanBook.role.__entity'
  | 'humanBook.status.__entity'
  | 'reader.gender.__entity'
  | 'reader.role.__entity'
  | 'reader.status.__entity'
>;
