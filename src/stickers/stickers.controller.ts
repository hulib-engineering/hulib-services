import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '@utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '@utils/infinity-pagination';

import { Sticker } from './domain/sticker';
import { FindAllStickersDto } from './dto/find-all-stickers.dto';
import { StickersService } from './stickers.service';

@ApiTags('Stickers')
@Controller({
  path: 'stickers',
  version: '1',
})
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  // @Post()
  // @ApiCreatedResponse({
  //   type: Sticker,
  // })
  // create(@Body() createStickerDto: CreateStickerDto) {
  //   return this.stickersService.create(createStickerDto);
  // }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Sticker),
  })
  async findAll(
    @Query() query: FindAllStickersDto,
  ): Promise<InfinityPaginationResponseDto<Sticker>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.stickersService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  // @Get(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: Sticker,
  // })
  // findOne(@Param('id') id: string) {
  //   return this.stickersService.findOne(id);
  // }
  //
  // @Patch(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: Sticker,
  // })
  // update(@Param('id') id: string, @Body() updateStickerDto: UpdateStickerDto) {
  //   return this.stickersService.update(id, updateStickerDto);
  // }
  //
  // @Delete(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // remove(@Param('id') id: string) {
  //   return this.stickersService.remove(id);
  // }
}
