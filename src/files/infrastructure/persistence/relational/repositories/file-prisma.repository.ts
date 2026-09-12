import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { FileType } from '@files/domain/file';
import { FileRepository } from '@files/infrastructure/persistence/file.repository';

import { FileMapperImplement } from '../mappers/file-mapper.implement';

@Injectable()
export class FileRepositoryImplement implements FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<FileType, 'id'>): Promise<FileType> {
    const created = await this.prisma.file.create({
      data: { path: data.path },
    });
    return FileMapperImplement.toDomain(created);
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const found = await this.prisma.file.findUnique({ where: { id } });
    return found ? FileMapperImplement.toDomain(found) : null;
  }
}
