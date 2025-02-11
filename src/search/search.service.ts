import { Injectable } from '@nestjs/common';
import { SearchDto } from './dto/search.dto';
import { PrismaService } from '../prisma-client/prisma-client.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}
  // prisma search stories
  async searchByKeyword(query: SearchDto) {
    const { keyword = '' } = query;

    const keywordTrimmed = keyword?.trim().replace('+', ' ');

    const stories = await this.prisma.story.findMany({
      where: {
        title: {
          contains: keywordTrimmed,
          mode: 'insensitive',
        },
      },
      include: {
        humanBook: true,
      },
      omit: {
        humanBookId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stories;
  }
}
