import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

const idType = Number;
export class FindAllSchedulesDto {
  @ApiProperty({
    type: idType,
  })
  id: number;

  @ApiProperty({
    type: () => User,
  })
  humanBook: User;

  @ApiProperty({
    type: () => User,
  })
  userLiber: User;

  @ApiProperty({
    type: Date,
    example: '2025-02-28T12:00:00Z',
  })
  startedAt: Date;

  @ApiProperty({
    type: String,
    example: '12:00',
  })
  startTime?: string | null;

  @ApiProperty({
    type: Date,
    example: '2025-02-28T13:00:00Z',
  })
  endedAt: Date;

  @ApiProperty({
    type: String,
    example: '13:00',
  })
  endTime?: string | null;

  @ApiProperty({
    type: Boolean,
    example: true,
  })
  isBooked?: boolean;
}
