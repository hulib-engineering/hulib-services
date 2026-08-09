import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateStoryReviewDto {
  @ApiPropertyOptional({
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  preRating?: number;

  @ApiProperty({
    type: Number,
    example: 2,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({
    type: String,
    example: 'This is a test title.',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    example: 'This is a test comment.',
  })
  @IsString()
  comment: string;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  storyId: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  userId: number;
}

// userId comes from the JWT, not the client
export class CreateStoryReviewBodyDto extends OmitType(CreateStoryReviewDto, [
  'userId',
] as const) {}
