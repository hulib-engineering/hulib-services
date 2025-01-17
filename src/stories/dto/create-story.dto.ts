import {
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
import { FileDto } from '../../files/dto/file.dto';
import { UserDto } from '../../users/dto/user.dto';
import { Type } from 'class-transformer';

export class CreateStoryDto {
  @ApiProperty()
  @IsString()
  abstract: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  cover?: FileDto | null;

  @ApiProperty({ example: { id: '8686' }, type: UserDto })
  @IsNotEmpty()
  @Type(() => UserDto)
  humanBook: UserDto;
  // Don't forget to use the class-validator decorators in the DTO properties.
}
