import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { FileType } from '@files/domain/file';
import { Sticker } from './domain/sticker';

export const stickerInclude = {
  include: { image: true },
} satisfies Prisma.stickerDefaultArgs;

type StickerRecord = Prisma.stickerGetPayload<typeof stickerInclude>;

function toDomain(raw: StickerRecord): Sticker {
  const domain = new Sticker();
  domain.id = raw.id;
  domain.name = raw.name;
  if (raw.image) {
    const image = new FileType();
    image.id = raw.image.id;
    image.path = raw.image.path;
    domain.image = image;
  }
  domain.createdAt = raw.createdAt;
  domain.updatedAt = raw.updatedAt;
  return domain;
}

@Injectable()
export class StickerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Sticker, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Sticker> {
    const created = await this.prisma.sticker.create({
      data: {
        name: data.name,
        imageId: data.image?.id,
      },
      ...stickerInclude,
    });
    return toDomain(created);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Sticker[]> {
    const rows = await this.prisma.sticker.findMany({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      ...stickerInclude,
    });
    return rows.map((row) => toDomain(row));
  }

  async findById(id: Sticker['id']): Promise<NullableType<Sticker>> {
    const found = await this.prisma.sticker.findUnique({
      where: { id: Number(id) },
      ...stickerInclude,
    });
    return found ? toDomain(found) : null;
  }

  async update(id: Sticker['id'], payload: Partial<Sticker>): Promise<Sticker> {
    const updated = await this.prisma.sticker.update({
      where: { id: Number(id) },
      data: {
        name: payload.name,
        imageId:
          payload.image === null ? null : (payload.image?.id ?? undefined),
      },
      ...stickerInclude,
    });
    return toDomain(updated);
  }

  async remove(id: Sticker['id']): Promise<void> {
    await this.prisma.sticker.delete({ where: { id: Number(id) } });
  }
}
