import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@files/domain/file';
import { Exclude } from 'class-transformer';

const idType = Number;

export class Sticker {
  @ApiProperty({
    type: idType,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'slapping',
  })
  name: string;

  @ApiProperty({
    type: () => FileType,
  })
  image?: FileType | null;

  @Exclude()
  @ApiProperty()
  createdAt: Date;

  @Exclude()
  @ApiProperty()
  updatedAt: Date;
}
