import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { BooksService } from './book.service';
import { RolesGuard } from '../roles/roles.guard';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Books')
@Controller({
  path: 'users',
  version: '1',
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // @ApiCreatedResponse({
  //   type: Book,
  // })
  // @SerializeOptions({
  //   groups: ['humanBook'],
  // })
  // @Post()
  // @Roles(RoleEnum.admin)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() createProfileDto: createNewHumanBookDto): Promise<Book> {
  //   return this.booksService.createHumanBook(createProfileDto);
  // }
}
