import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/domain/user';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';

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

  @ApiProperty({
    type: Number,
  })
  huberId: number;

  @ApiProperty({
    type: () => User,
  })
  huber: User;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(createTimeSlotDto?: CreateTimeSlotDto) {
    this.startTime = createTimeSlotDto?.startTime ?? '';
    this.dayOfWeek = createTimeSlotDto?.dayOfWeek ?? 0;
  }
}
