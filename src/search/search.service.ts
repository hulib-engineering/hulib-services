import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';

import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoryIdsByAccentedKeyword(text?: string | null) {
    if (!text) return { ids: [], highlightTitles: [], highlightAbstracts: [] };
    // Search accent case with View
    const unaccentedLower = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase();
    const nameWhere = `unaccent(lower(title)) ilike '%${unaccentedLower(text)}%'`;
    const where = [...(nameWhere ? [nameWhere] : [])].join(' OR ');
    const founds: {
      id: number;
      highlight_title: string;
      highlight_abstract: string;
    }[] = await this.prisma.$queryRawUnsafe(
      `SELECT id, ts_headline(title, plainto_tsquery('${text}'), 'HighlightAll=true') as highlight_title, ts_headline(abstract, plainto_tsquery('${text}'), 'HighlightAll=true') as highlight_abstract
      FROM story
      WHERE to_tsvector(abstract) @@ plainto_tsquery('${text}') OR to_tsvector(title) @@ plainto_tsquery('${text}') OR ${where};`,
    );

    const ids = founds.map((el) => el.id);
    const highlightTitles = founds.map((el) => el.highlight_title);
    const highlightAbstracts = founds.map((el) => el.highlight_abstract);
    return { ids, highlightTitles, highlightAbstracts };
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

    const { ids, highlightTitles, highlightAbstracts } =
      await this.getStoryIdsByAccentedKeyword(keywordTrimmed);
    const stories = await this.prisma.story.findMany({
      where: {
        id: { in: ids },
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

    const serializedStories = stories.map((story, index) => ({
      ...story,
      topics: story.topics.map((topic) => ({
        ...topic.topic,
      })),
      highlightTitle:
        highlightTitles[index] !== story.title ? highlightTitles[index] : null,
      highlightAbstract:
        highlightAbstracts[index] !== story.abstract
          ? highlightAbstracts[index]
          : null,
    }));

    return {
      stories: serializedStories,
      hubers,
    };
  }
}
