import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@tags/domain/tag';
import { IsNumber } from 'class-validator';
import { Book } from '@books/domain/book';

export class TagDto implements Tag {
  content?: string | undefined;

  constructor(id: number, content?: string, books: Book[] = []) {
    this.content = content;
    this.books = books;
    this.id = id;
  }

  @ApiProperty({ type: [Book] })
  books: Book[];

  @ApiProperty()
  @IsNumber()
  id: number;
}
