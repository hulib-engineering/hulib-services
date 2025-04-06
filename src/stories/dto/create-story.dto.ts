import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  // decorators here
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { FileDto } from '@files/dto/file.dto';
import { UserDto } from '@users/dto/user.dto';
import { Type } from 'class-transformer';
import { PublishStatus } from '@stories/status.enum';
import { TopicDto } from '../../topics/dto/topic.dto';

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

  @ApiProperty({ example: { id: '8686' }, type: UserDto })
  @IsNotEmpty()
  @Type(() => UserDto)
  humanBook: UserDto;

  @ApiPropertyOptional({
    type: String,
    example: PublishStatus[1],
  })
  @IsOptional()
  @IsIn(Object.keys(PublishStatus).filter((key) => isNaN(Number(key))))
  publishStatus: string;
  // Don't forget to use the class-validator decorators in the DTO properties.

  @ApiProperty({ type: [TopicDto] })
  @ValidateNested({ each: true })
  @Type(() => TopicDto)
  topics: TopicDto[];
}
