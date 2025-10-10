import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { User } from '@users/domain/user';
import { Story } from '@stories/domain/story';
import { PublishStatus } from '@stories/status.enum';

@Injectable()
export class FavStoriesService {
  constructor(private prisma: PrismaService) {}

  async addToFavorites(userId: User['id'], storyId: Story['id']) {
    const story = await this.prisma.story.findUnique({
      where: { id: Number(storyId) },
    });
    if (!story) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: {
          story: 'storyNotFound',
        },
      });
    }

    return this.prisma.storyFavorite.create({
      data: {
        userId: Number(userId),
        storyId: Number(storyId),
      },
    });
  }

  removeFromFavorites(userId: User['id'], storyId: User['id']) {
    return this.prisma.storyFavorite.delete({
      where: {
        userId_storyId: { userId: Number(userId), storyId: Number(storyId) },
      },
    });
  }

  async getFavoriteStories(userId: number) {
    const favorites = await this.prisma.storyFavorite.findMany({
      where: { userId },
      include: {
        story: {
          include: {
            humanBook: {
              include: {
                gender: true,
                role: true,
                status: true,
              },
              omit: {
                deletedAt: true,
                genderId: true,
                roleId: true,
                statusId: true,
                photoId: true,
                password: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!favorites.length) {
      return [];
    }

    return favorites.map((favorite) => {
      const { id, publishStatus, ...rest } = favorite.story;
      return {
        storyId: id,
        publishStatus: PublishStatus[publishStatus],
        ...rest,
      };
    });
  }

  async sortFavoriteStoriesByCreatedAt(userId: number) {
    const [userFavorites, allStories] = await Promise.all([
      this.prisma.storyFavorite.findMany({
        where: { userId },
        select: { storyId: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.story.findMany({
        where: {
          publishStatus: PublishStatus.published,
        },
        include: {
          humanBook: {
            include: {
              gender: true,
              role: true,
              status: true,
            },
            omit: {
              deletedAt: true,
              genderId: true,
              roleId: true,
              statusId: true,
              photoId: true,
              password: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (allStories.length === 0) {
      return [];
    }

    const favoriteStoryIds = new Set(userFavorites.map((fav) => fav.storyId));

    const { favoriteStories, nonFavoriteStories } = allStories.reduce(
      (acc, story) => {
        const storyWithFavoriteFlag = {
          ...story,
          isFavorite: favoriteStoryIds.has(story.id),
        };

        if (favoriteStoryIds.has(story.id)) {
          acc.favoriteStories.push(storyWithFavoriteFlag);
        } else {
          acc.nonFavoriteStories.push(storyWithFavoriteFlag);
        }

        return acc;
      },
      {
        favoriteStories: [] as Array<
          (typeof allStories)[number] & { isFavorite: boolean }
        >,
        nonFavoriteStories: [] as Array<
          (typeof allStories)[number] & { isFavorite: boolean }
        >,
      },
    );

    return [...favoriteStories, ...nonFavoriteStories];
  }

  async removeFavoriteStory(storyId: number, userId: number) {
    const deleteFavorite = await this.prisma.storyFavorite.deleteMany({
      where: { storyId, userId },
    });

    return {
      message:
        deleteFavorite.count > 0
          ? 'Favorite removed successfully'
          : 'Favorite not found',
      deletedCount: deleteFavorite.count,
    };
  }

  async removeAllFavoriteStories(userId: User['id']) {
    const deleteAllFavorites = await this.prisma.storyFavorite.deleteMany({
      where: { userId: Number(userId) },
    });

    return {
      message:
        deleteAllFavorites.count > 0
          ? 'All favorites removed successfully'
          : 'No favorites to remove',
      deletedCount: deleteAllFavorites.count,
    };
  }

  async saveFavoriteStory(storyId: number, userId: number) {
    if (!storyId || !userId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          message: 'storyId Or UserId Required',
        },
      });
    }
    const existingFavorite = await this.prisma.storyFavorite.findFirst({
      where: { storyId, userId },
    });
    if (existingFavorite) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          message: 'favorite Already Exists',
        },
      });
    }

    const favorite = await this.prisma.storyFavorite.create({
      data: {
        user: { connect: { id: userId } },
        story: { connect: { id: storyId } },
      },
    });

    if (!favorite) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          message: 'Failed to save favorite story',
        },
      });
    }
    return favorite;
  }
}
