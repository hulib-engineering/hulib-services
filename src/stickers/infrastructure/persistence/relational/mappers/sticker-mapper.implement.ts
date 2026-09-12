import { Prisma } from '@prisma/client';
import { Sticker } from '../../../../domain/sticker';
import { FileMapperImplement } from '@files/infrastructure/persistence/relational/mappers/file-mapper.implement';

export const stickerInclude = {
  include: { image: true },
} satisfies Prisma.stickerDefaultArgs;

export type StickerRecord = Prisma.stickerGetPayload<typeof stickerInclude>;

export class StickerMapperImplement {
  static toDomain(raw: StickerRecord): Sticker {
    const domain = new Sticker();
    domain.id = raw.id;
    domain.name = raw.name;
    if (raw.image) {
      domain.image = FileMapperImplement.toDomain(raw.image);
    }
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }
}
