import { Module } from '@nestjs/common';
import { BooksController } from './book.controller';
import { BooksService } from './book.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
