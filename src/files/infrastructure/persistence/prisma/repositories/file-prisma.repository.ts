import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { FileType } from '@files/domain/file';
import { FileRepository } from '@files/infrastructure/persistence/file.repository';
import { NullableType } from '@utils/types/nullable.type';

@Injectable()
export class PrismaFileRepository implements FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<FileType, 'id'>): Promise<FileType> {
    const entity = await this.prisma.file.create({
      data: {
        path: data.path,
      },
    });

    return this.toDomain(entity);
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const entity = await this.prisma.file.findUnique({
      where: {
        id,
      },
    });

    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: { id: string; path: string }): FileType {
    const file = new FileType();
    file.id = entity.id;
    file.path = entity.path;
    return file;
  }
}
