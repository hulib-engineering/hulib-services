import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../domain/tag';
import { IsNumber } from 'class-validator';

export class GenderDto implements Tag {
  @ApiProperty()
  @IsNumber()
  id: number;
}
