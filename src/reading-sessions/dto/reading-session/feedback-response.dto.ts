import { IsNumber, IsOptional, IsString, IsDate } from 'class-validator';

export class FeedbackResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  readingSessionId: number;

  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
