import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class SaveFavStoryDto {
  @ApiProperty()
  @IsString()
  storyId: string;
}
