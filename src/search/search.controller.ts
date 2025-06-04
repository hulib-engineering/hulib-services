import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@Controller('search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  searchByKeyword(@Query() searchDto: SearchDto) {
    return this.searchService.searchByKeyword(searchDto);
  }
}
