import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { User } from '@users/domain/user';

@Injectable()
export class UserFavoriteHuberService {
  constructor(private prisma: PrismaService) {}

  async add(userId: User['id'], huberId: number) {
    const huber = await this.prisma.user.findUnique({
      where: { id: Number(huberId) },
    });

    if (!huber) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: {
          huber: 'huberNotFound',
        },
      });
    }

    const existingFav = await this.prisma.huberFavorite.findFirst({
      where: {
        userId: Number(userId),
        huberId: Number(huberId),
      },
    });

    if (existingFav) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          huber: 'alreadyFavorited',
        },
      });
    }

    return this.prisma.huberFavorite.create({
      data: {
        userId: Number(userId),
        huberId: Number(huberId),
      },
    });
  }

  getFavoriteHubers(userId: User['id']) {
    return this.prisma.huberFavorite.findMany({
      where: { userId: Number(userId) },
      include: {
        huber: true,
      },
    });
  }

  async removeFavorite(userId: number, huberId: number) {
    const favorite = await this.prisma.huberFavorite.findUnique({
      where: {
        userId_huberId: {
          userId: Number(userId),
          huberId: Number(huberId),
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: {
          favorite: 'favoriteNotFound',
        },
      });
    }

    return this.prisma.huberFavorite.delete({
      where: {
        userId_huberId: {
          userId: Number(userId),
          huberId: Number(huberId),
        },
      },
    });
  }

  removeAll(userId: User['id']) {
    return this.prisma.huberFavorite.deleteMany({
      where: {
        userId: Number(userId),
      },
    });
  }
}
