import { IsInt } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AddHuberToFavListDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  huberId: number;
}
