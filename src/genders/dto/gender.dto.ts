import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@genders/domain/gender';
import { IsNumber } from 'class-validator';

export class GenderDto implements Gender {
  @ApiProperty()
  @IsNumber()
  id: number;
}
