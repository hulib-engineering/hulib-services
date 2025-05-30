import { IsNumber, IsOptional, IsString, IsDate } from 'class-validator';

export class CreateFeedbackDto {
  @IsNumber()
  preRating: number;

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
