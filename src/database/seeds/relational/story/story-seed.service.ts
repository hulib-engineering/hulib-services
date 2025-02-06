import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-client/prisma.service';

@Injectable()
export class StorySeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const storyCount = await this.prisma.story.count();
    // const humanBook = await this.prisma.user.findFirst();
    // const cover = await this.prisma.file.findFirst();
    const topics = await this.prisma.topics.findMany();

    if (!storyCount) {
      await this.prisma.story.create({
        data: {
          id: 1,
          title: 'Story 1',
          humanBookId: 1,
          coverId: '1',
          topics: {
            connect: topics.map((topic) => ({ id: topic.id })),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          humanBook: true,
          cover: true,
          topics: true,
        },
      });
    }
  }
}
