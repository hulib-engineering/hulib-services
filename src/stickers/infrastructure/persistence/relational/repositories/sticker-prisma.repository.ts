import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Sticker } from '../../../../domain/sticker';
import { StickerRepository } from '../../sticker.repository';

import {
  stickerInclude,
  StickerMapperImplement,
} from '../mappers/sticker-mapper.implement';

@Injectable()
export class StickerRepositoryImplement implements StickerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Sticker): Promise<Sticker> {
    const created = await this.prisma.sticker.create({
      data: {
        name: data.name,
        imageId: data.image?.id,
      },
      ...stickerInclude,
    });
    return StickerMapperImplement.toDomain(created);
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
    return rows.map((row) => StickerMapperImplement.toDomain(row));
  }

  async findById(id: Sticker['id']): Promise<NullableType<Sticker>> {
    const found = await this.prisma.sticker.findUnique({
      where: { id: Number(id) },
      ...stickerInclude,
    });
    return found ? StickerMapperImplement.toDomain(found) : null;
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
    return StickerMapperImplement.toDomain(updated);
  }

  async remove(id: Sticker['id']): Promise<void> {
    await this.prisma.sticker.delete({ where: { id: Number(id) } });
  }
}
