import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAppealDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the moderation action being appealed',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  moderationId: number;

  @ApiProperty({
    type: String,
    description: 'Detailed explanation of why the appeal should be considered',
    example:
      'I believe this moderation action was unjustified because I did not violate any community guidelines. The reported content was a misunderstanding.',
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;
}
