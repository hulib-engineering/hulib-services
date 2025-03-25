import { ApiProperty } from '@nestjs/swagger';
import { Double } from 'typeorm';

const idType = Number;

export class TimeSlot {
  @ApiProperty({
    type: idType,
  })
  id: number;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  dayOfWeek: number;

  @ApiProperty({
    type: Number,
    example: 6.5,
  })
  startTime: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
