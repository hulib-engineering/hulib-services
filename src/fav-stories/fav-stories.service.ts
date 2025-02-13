import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class FavStoriesService {
  constructor(private prisma: PrismaService) {}

  // async getFavoriteStories(userId: number) {
  //   const favorites = await this.prisma.storyFavorite.findMany({
  //     where: { userId },
  //     include: {
  //       story: true,
  //     },
  //   });

  //   if (!favorites.length) {
  //     throw new NotFoundException('No favorite stories found for this user');
  //   }

  //   return favorites.map((favorite) => favorite.story);
  // }
}
