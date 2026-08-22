import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@Controller('search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Search published stories and hubers (human books) by keyword. Stories match when their title or abstract contains the full keyword phrase (accent-insensitive); hubers match when their full name contains the keyword.',
  })
  @ApiOkResponse({
    description:
      'Stories have the same shape as items returned by GET /v1/stories.',
    schema: {
      type: 'object',
      properties: {
        stories: {
          type: 'array',
          description: 'Published stories matching the keyword',
          items: { type: 'object' },
        },
        hubers: {
          type: 'array',
          description:
            'Human book users whose full name matches, including their active topics',
          items: { type: 'object' },
        },
      },
    },
  })
  searchByKeyword(@Query() searchDto: SearchDto) {
    return this.searchService.searchByKeyword(searchDto);
  }
}
