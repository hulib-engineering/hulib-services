import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';

import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoryIdsByAccentedKeyword(text?: string | null) {
    if (!text) return [];
    // Search accent case with View
    const unaccentedLower = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase();
    const nameWhere = `unaccent(lower(title)) ilike '%${unaccentedLower(text)}%'`;
    const where = [...(nameWhere ? [nameWhere] : [])].join(' OR ');
    const founds: { id: number }[] = await this.prisma.$queryRawUnsafe(
      `SELECT id FROM "story" WHERE ${where};`,
    );
    return founds.map((el) => el.id);
  }

  // prisma search stories
  async searchByKeyword(query: SearchDto) {
    const { keyword = '' } = query;

    const keywordTrimmed = keyword?.trim().replace('+', ' ');

    const hubers = await this.prisma.user.findMany({
      where: {
        roleId: RoleEnum.humanBook,
        fullName: {
          contains: keywordTrimmed,
          mode: 'insensitive',
        },
      },
      include: {
        humanBookTopic: true,
      },
    });

    // const stories = await this.prisma.story.findMany({
    //   where: {
    //     title: {
    //       contains: unidecode(keywordTrimmed),
    //       mode: 'insensitive',
    //     },
    //   },
    //   include: {
    //     humanBook: true,
    //   },
    //   omit: {
    //     humanBookId: true,
    //   },
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    // });
    const stories = await this.prisma.story.findMany({
      where: {
        id: { in: await this.getStoryIdsByAccentedKeyword(keywordTrimmed) },
      },
      include: {
        humanBook: {
          select: {
            fullName: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        topics: {
          select: {
            topic: {
              select: { id: true, name: true },
            },
          },
        },
        storyReview: true,
        cover: true,
      },
      omit: { humanBookId: true, coverId: true },
    });

    const serializedStories = stories.map((story) => ({
      ...story,
      topics: story.topics.map((topic) => ({
        ...topic.topic,
      })),
    }));

    return {
      stories: serializedStories,
      hubers,
    };
  }
}
