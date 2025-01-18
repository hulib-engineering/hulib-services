import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { FileType } from '../../files/domain/file';

const idType = Number;

export class Story {
  @ApiProperty({
    type: idType,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Some abstract line',
  })
  abstract?: string | null;

  @ApiProperty({
    type: String,
    example: 'Some title',
  })
  title: string;

  @ApiProperty({
    type: () => FileType,
  })
  cover?: FileType | null;

  @ApiProperty({
    type: () => User,
  })
  humanBook: User;

  @ApiProperty({
    type: Number,
    example: 4,
  })
  rating?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
