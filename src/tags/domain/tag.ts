import { ApiProperty } from '@nestjs/swagger';
import { Book } from '@books/domain/book';

export class Tag {
  @ApiProperty({
    type: Number,
  })
  id: number | string;

  @ApiProperty({
    type: String,
  })
  content?: string;

  @ApiProperty({
    type: String,
  })
  books: Book[];
}
