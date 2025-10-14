import { IsInt } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AddStoryToFavListDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  storyId: number;
}
