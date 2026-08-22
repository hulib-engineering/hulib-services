import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { StoriesService } from '@stories/stories.service';
import { PublishStatus } from '@stories/status.enum';
import { TopicStatus } from '@topics/topic-status.enum';

import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storiesService: StoriesService,
  ) {}

  // Story ids whose title or abstract contains the FULL keyword phrase
  // (accent-insensitive), e.g. 'hai vì sao' must appear as-is inside the
  // title/abstract — not word-by-word.
  async getStoryIdsByKeyword(text?: string | null): Promise<number[]> {
    const keyword = text?.trim();
    if (!keyword) return [];

    // Escape LIKE wildcard characters (\ % _) so user input is treated literally
    const escapedLike = keyword.replace(/[\\%_]/g, '\\$&');

    const rows: { id: number }[] = await this.prisma.$queryRaw`
      SELECT id
      FROM story
      WHERE unaccent(lower(title)) ILIKE '%' || unaccent(lower(${escapedLike})) || '%'
        OR unaccent(lower(abstract)) ILIKE '%' || unaccent(lower(${escapedLike})) || '%';
    `;

    return rows.map((row) => row.id);
  }

  // prisma search stories
  async searchByKeyword(query: SearchDto) {
    const { keyword = '' } = query;

    const keywordTrimmed = keyword?.trim().replace('+', ' ');

    const [hubers, storyIds] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          roleId: RoleEnum.humanBook,
          fullName: {
            contains: keywordTrimmed,
            mode: 'insensitive',
          },
        },
        include: {
          humanBookTopic: {
            where: {
              topic: {
                status: TopicStatus.active,
              },
            },
            include: {
              topic: true,
            },
          },
        },
      }),
      this.getStoryIdsByKeyword(keywordTrimmed),
    ]);

    // No match — skip the listing query entirely (an empty ids filter would
    // otherwise mean "no restriction" in the repository).
    if (!storyIds.length) {
      return { stories: [], hubers };
    }

    // Reuse the GET /stories pipeline so every returned story has the exact
    // same shape as the stories listing API (stats, review overview and an
    // S3-presigned/local cover path).
    const { data: stories } =
      await this.storiesService.findAllWithCountAndPagination({
        paginationOptions: { page: 1, limit: storyIds.length },
        filterOptions: {
          ids: storyIds,
          publishStatus: PublishStatus.published,
        },
      });

    return {
      stories,
      hubers,
    };
  }
}
