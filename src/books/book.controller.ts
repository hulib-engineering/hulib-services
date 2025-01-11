import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { BooksService } from './book.service';
import { RolesGuard } from '../roles/roles.guard';
import { Book } from './domain/book';
import { createNewHumanBookDto } from './dto/create-new-human-book.dto';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Books')
@Controller({
  path: 'books',
  version: '1',
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Book })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(@Body() createBookDto: createNewHumanBookDto): Promise<Book> {
    return this.booksService.createBook(createBookDto);
  }
}
