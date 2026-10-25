import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  // decorators here
  IsString,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { FileDto } from '@files/dto/file.dto';
import { topicIdsTransformer } from '@utils/transformers/topic-ids.transformer';
import { PublishStatus } from '@stories/status.enum';
import { Topic } from '../../topics/domain/topics';

export class CreateStoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  abstract: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  cover?: FileDto | null;

  @ApiProperty({ example: [{ id: '1' }, { id: '2' }], type: () => [Topic] })
  @IsOptional()
  @Transform(topicIdsTransformer)
  topics?: Topic[] | [];

  @ApiPropertyOptional({
    type: String,
    example: PublishStatus[1],
  })
  @IsOptional()
  @IsIn(Object.keys(PublishStatus).filter((key) => isNaN(Number(key))))
  publishStatus?: string;
  // Don't forget to use the class-validator decorators in the DTO properties.

  @ApiProperty()
  @IsString()
  @IsOptional()
  rejectionReason: string;
}
