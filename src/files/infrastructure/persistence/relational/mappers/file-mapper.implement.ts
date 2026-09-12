import { Prisma } from '@prisma/client';
import { FileType } from '@files/domain/file';

export type FileRecord = Prisma.fileGetPayload<Record<string, never>>;

export class FileMapperImplement {
  static toDomain(raw: FileRecord): FileType {
    const domain = new FileType();
    domain.id = raw.id;
    domain.path = raw.path;
    return domain;
  }
}
