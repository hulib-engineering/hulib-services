import {
  // decorators here
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateTimeSlotDto {
  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  dayOfWeek: number;

  @ApiProperty({
    type: Number,
    example: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  startTime: number;
}
