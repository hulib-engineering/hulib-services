import { ApiProperty } from '@nestjs/swagger';
export class Topic {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class Topics extends Topic {}
