import { IsNumber } from 'class-validator';

export class CreateSurveyQuestionDtoDto {
  @IsNumber()
  id: number;

  @IsNumber()
  rating: number;
}
