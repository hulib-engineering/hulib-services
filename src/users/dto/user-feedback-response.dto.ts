import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileDto } from '@files/dto/file.dto';

export class FeedbackByUserDto {
  @ApiProperty({ type: Number, example: 1 })
  id!: number | null;

  @ApiProperty({ type: String, example: 'Nguyen Van A', nullable: true })
  fullName!: string | null;

  @ApiPropertyOptional({ type: () => FileDto, nullable: true })
  photo!: FileDto | null;
}

export class UserFeedbackItemDto {
  @ApiProperty({ type: Number, example: 1 })
  id!: number;

  @ApiProperty({ type: Number, example: 4.5 })
  rating!: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Great session!',
  })
  content!: string | null;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: () => FeedbackByUserDto })
  feedbackBy!: FeedbackByUserDto;
}
