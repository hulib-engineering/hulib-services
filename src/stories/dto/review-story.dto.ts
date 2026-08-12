import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewStoryDto {
  @ApiProperty({
    type: String,
    enum: ['published', 'rejected'],
    example: 'published',
  })
  @IsIn(['published', 'rejected'])
  publishStatus: 'published' | 'rejected';

  @ApiPropertyOptional({
    type: String,
    example: 'Cover image does not follow guidelines',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
