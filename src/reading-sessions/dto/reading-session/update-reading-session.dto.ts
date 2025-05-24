import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingSessionDto } from './create-reading-session.dto';
import { ReadingSessionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateFeedbackDto } from '@reading-sessions/dto/reading-session/create-feedback.dto';
import { CreateStoryReviewDto } from '@story-reviews/dto/create-story-review.dto';

export class UpdateReadingSessionDto extends PartialType(
  CreateReadingSessionDto,
) {
  @ApiProperty({
    enum: ReadingSessionStatus,
    example: ReadingSessionStatus.finished,
    description: 'The status of the reading session',
  })
  @IsOptional()
  @IsEnum(ReadingSessionStatus)
  sessionStatus?: ReadingSessionStatus;

  @ApiPropertyOptional({
    example: 'Reason for canceling the reading session',
    description: 'Note or reason when canceling the reading session',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    type: () => CreateFeedbackDto,
    example: { rating: 5, content: 'Very Helpful Reading feedback' },
  })
  @IsOptional()
  sessionFeedback?: CreateFeedbackDto;

  @ApiProperty({
    type: () => CreateStoryReviewDto,
    example: {
      rating: 5,
      title: 'Good',
      comment: 'Very Helpful Reading feedback',
    },
  })
  @IsOptional()
  storyReview?: CreateStoryReviewDto;
}
