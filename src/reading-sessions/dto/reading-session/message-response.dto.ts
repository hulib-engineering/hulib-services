import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class MessageResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  readingSessionId: number;

  @IsNumber()
  humanBookId: number;

  @IsNumber()
  readerId: number;

  @IsString()
  content: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
