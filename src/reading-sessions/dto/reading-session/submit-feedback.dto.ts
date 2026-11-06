import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class HuberFeedbackDto {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 4,
    description: 'Required unless skipped is true.',
  })
  @ValidateIf((dto: HuberFeedbackDto) => !dto.skipped)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Very thoughtful and open.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    type: Boolean,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  skipped?: boolean;
}

export class SubmitFeedbackDto {
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  feelingRating: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  satisfactionRating: number;

  @ApiPropertyOptional({
    type: String,
    example: 'The session helped me see my situation more clearly.',
  })
  @IsOptional()
  @IsString()
  sessionContent?: string;

  @ApiProperty({ type: HuberFeedbackDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => HuberFeedbackDto)
  huber: HuberFeedbackDto;
}
