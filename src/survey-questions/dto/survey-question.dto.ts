import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { SurveyQuestion } from '../domain/survey-question';

export class SurveyQuestionDto implements SurveyQuestion {
  @ApiProperty()
  @IsNumber()
  id: number;
}
