import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingSessionDto } from './create-reading-session.dto';
import { ReadingSessionStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateFeedbackDto } from '@reading-sessions/dto/reading-session/create-feedback.dto';
import { CreateSurveyQuestionDtoDto } from '@reading-sessions/dto/reading-session/create-survey-question.dto';
import { Type } from 'class-transformer';
import { SurveyQuestionEnum } from '../../../survey-questions/survey-questions.enum';

export class UpdateReadingSessionDto extends PartialType(
  CreateReadingSessionDto,
) {
  @ApiPropertyOptional({
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

  @ApiPropertyOptional({
    example: 'Reason for rejecting the reading session',
    description: 'Note or reason when rejecting the reading session',
  })
  @IsOptional()
  @IsString()
  rejectReason?: string;

  @ApiPropertyOptional({
    type: () => CreateFeedbackDto,
    example: { rating: 5 },
  })
  @IsOptional()
  sessionFeedback?: CreateFeedbackDto;

  @ApiPropertyOptional({
    type: () => CreateFeedbackDto,
    example: {
      rating: 5,
      content: 'Very Interesting Story',
    },
  })
  @IsOptional()
  storyReview?: CreateFeedbackDto;

  @ApiPropertyOptional({
    type: () => CreateFeedbackDto,
    example: {
      rating: 5,
      content: 'Very Informative Huber Sharing',
    },
  })
  @IsOptional()
  huberFeedback?: CreateFeedbackDto;

  @ApiPropertyOptional({
    type: [CreateSurveyQuestionDtoDto],
    description: 'List of survey questions',
    example: [
      { id: SurveyQuestionEnum['How are you feeling today?'], rating: 5 },
      {
        id: SurveyQuestionEnum['How relevant does the story to your problem?'],
        rating: 4,
      },
      {
        id: SurveyQuestionEnum[
          "How relevant does the Huber's profile to your interest?"
        ],
        rating: 3,
      },
      {
        id: SurveyQuestionEnum[
          'To what extent do you think this session will help you?'
        ],
        rating: 2,
      },
    ],
  })
  @IsArray({ message: 'List of survey questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionDtoDto)
  @IsOptional()
  presurvey?: CreateSurveyQuestionDtoDto[];

  @IsString()
  @IsOptional()
  recordingUrl?: string;

  @IsOptional()
  @IsString()
  sessionUrl?: string;
}
