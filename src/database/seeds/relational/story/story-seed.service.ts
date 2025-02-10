import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

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
            create: topics.map((topic) => ({
              topicId: topic.id,
              storyId: 1,
            })),
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
