import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { HumanBooksService } from './human-books.service';
import { CreateHumanBooksDto } from './dto/create-human-books.dto';
import { UpdateHumanBooksDto } from './dto/update-human-books.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HumanBooks } from './domain/human-books';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllHumanBooksDto } from './dto/find-all-human-books.dto';

@ApiTags('Humanbooks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'human-books',
  version: '1',
})
export class HumanBooksController {
  constructor(private readonly humanBooksService: HumanBooksService) {}

  @Post()
  @ApiCreatedResponse({
    type: HumanBooks,
  })
  create(@Body() createHumanBooksDto: CreateHumanBooksDto) {
    return this.humanBooksService.create(createHumanBooksDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(HumanBooks),
  })
  async findAll(
    @Query() query: FindAllHumanBooksDto,
  ): Promise<InfinityPaginationResponseDto<HumanBooks>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.humanBooksService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: HumanBooks,
  })
  findOne(@Param('id') id: number) {
    return this.humanBooksService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: HumanBooks,
  })
  update(
    @Param('id') id: number,
    @Body() updateHumanBooksDto: UpdateHumanBooksDto,
  ) {
    return this.humanBooksService.update(id, updateHumanBooksDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: number) {
    return this.humanBooksService.remove(id);
  }
}
