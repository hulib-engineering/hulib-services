import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserFavoriteHuberService } from './fav-hubers.service';
import { FavoriteHuberDto } from './dto/favorite-huber.dto';
import { SaveFavHuberDto } from './dto/save-fav-huber.dto';

@ApiTags('Favorited Hubers')
@Controller({
  path: 'fav-hubers',
  version: '1',
})
export class UserFavoriteHuberController {
  constructor(
    private readonly userFavoriteHuberService: UserFavoriteHuberService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a favorite huber by id' })
  @ApiCreatedResponse({
    type: FavoriteHuberDto,
  })
  create(@Body() saveFavHuberDto: SaveFavHuberDto) {
    return this.userFavoriteHuberService.add(
      saveFavHuberDto.userId,
      saveFavHuberDto.huberId,
    );
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all favorite hubers' })
  @ApiOkResponse({
    description: 'Get list of favorite hubers',
    type: [FavoriteHuberDto],
  })
  getFavoriteHubers(@Param('userId') userId: number) {
    return this.userFavoriteHuberService.getFavoriteHubers(userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove all favorite hubers' })
  @ApiOkResponse({
    description: 'Remove all favorite hubers',
    type: [FavoriteHuberDto],
  })
  removeAllFavoriteHubers(@Query('userId') userId: number) {
    return this.userFavoriteHuberService.removeAll(userId);
  }

  @Delete(':huberId')
  @ApiOperation({ summary: 'Remove a favorite huber' })
  @ApiOkResponse({
    description: 'Remove a favorite huber',
    type: FavoriteHuberDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @Param('huberId') huberId: number,
    @Query('userId') userId: number,
  ) {
    return this.userFavoriteHuberService.removeFavorite(
      Number(userId),
      Number(huberId),
    );
  }
}
