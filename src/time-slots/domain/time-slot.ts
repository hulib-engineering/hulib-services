import { ApiProperty } from '@nestjs/swagger';

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
    example: 6,
  })
  startTime: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
