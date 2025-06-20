import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class FavStoriesService {
  constructor(private prisma: PrismaService) {}

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
      const { id, ...rest } = favorite.story;
      return { storyId: id, ...rest };
    });
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

  async removeAllFavoriteStories(userId: number) {
    const deleteAllFavorites = await this.prisma.storyFavorite.deleteMany({
      where: { userId },
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
