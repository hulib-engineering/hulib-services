import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { file as PrismaFile } from '@prisma/client';
import { NullableType } from '@utils/types/nullable.type';
import { FileType } from './domain/file';

function toDomain(raw: Pick<PrismaFile, 'id' | 'path'>): FileType {
  const domain = new FileType();
  domain.id = raw.id;
  domain.path = raw.path;
  return domain;
}

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<FileType, 'id'>): Promise<FileType> {
    const created = await this.prisma.file.create({
      data: { path: data.path },
    });
    return toDomain(created);
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const found = await this.prisma.file.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }
}
