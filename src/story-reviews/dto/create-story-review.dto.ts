import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateStoryReviewDto {
  @ApiPropertyOptional({
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  preRating?: number;

  @ApiProperty({
    type: Number,
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    type: String,
    example: '',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    example: '1111111111111111111',
  })
  @IsString()
  comment: string;

  @ApiProperty({
    type: Number,
    example: 79,
  })
  @IsInt()
  storyId: number;

  @ApiProperty({
    type: Number,
    example: 169,
  })
  @IsInt()
  userId: number;
}
