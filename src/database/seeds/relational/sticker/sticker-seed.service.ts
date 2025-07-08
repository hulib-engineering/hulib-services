import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class StickerSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const count = await this.prisma.sticker.count();

    const stickerNames = [
      'like',
      'confidence',
      'shocking',
      'slapping',
      'stop',
      'hug',
      'no',
      'chill',
      'surprised',
      'relaxed',
    ];
    if (!count) {
      const stickers = await Promise.all(
        stickerNames.map(async (stickerName) => {
          await this.prisma.sticker.create({
            data: {
              name: stickerName,
            },
            include: {
              image: true,
            },
          });
        }),
      );

      console.log(`✅ Created ${stickers.length} stickers`);
    }
  }
}
