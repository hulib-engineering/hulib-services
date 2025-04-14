import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class TopicSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const countTopics = await this.prisma.topics.count();

    if (!countTopics) {
      const savedTopics = await Promise.all(
        [...Array(10)].map(async () => {
          await this.prisma.topics.create({
            data: {
              name: faker.book.genre(),
            },
          });
        }),
      );

      console.log(`✅ Created ${savedTopics.length} hubers`);
    }
  }
}
