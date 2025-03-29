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
    type: String,
    example: '06:00',
  })
  startTime: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
