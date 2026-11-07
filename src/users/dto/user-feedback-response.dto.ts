import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from '@files/dto/file.dto';

export class FeedbackByDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: String, nullable: true })
  fullName: string | null;

  @ApiProperty({ type: FileDto, nullable: true })
  photo?: FileDto | null;
}

export class UserFeedbackResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: String, nullable: true })
  content: string | null;

  @ApiProperty({ type: Number, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: FeedbackByDto, nullable: true })
  feedbackBy: FeedbackByDto | null;
}
