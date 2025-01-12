import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Topics } from '../../topics/domain/topics';

export class HumanBooks {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: () => User,
  })
  user?: User | null;

  @ApiProperty()
  bio: string | null;

  @ApiProperty()
  videoUrl: string | null;

  @ApiProperty()
  education: string | null;

  @ApiProperty()
  educationStart: Date | null;

  @ApiProperty()
  educationEnd?: Date | null;

  @ApiProperty({
    type: () => [Topics],
  })
  topics: Topics[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
