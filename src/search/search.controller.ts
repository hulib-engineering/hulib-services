import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  searchByKeyword(@Query() searchDto: SearchDto) {
    return this.searchService.searchByKeyword(searchDto);
  }
}
