import { Sticker } from '../../../../domain/sticker';
import { StickerEntity } from '../entities/sticker.entity';
import { FileEntity } from '@files/infrastructure/persistence/relational/entities/file.entity';
import { FileMapper } from '@files/infrastructure/persistence/relational/mappers/file.mapper';

export class StickerMapper {
  static toDomain(raw: StickerEntity): Sticker {
    const domainEntity = new Sticker();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;

    if (raw.image) {
      domainEntity.image = FileMapper.toDomain(raw.image);
    }

    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Sticker): StickerEntity {
    const persistenceEntity = new StickerEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    let image: FileEntity | undefined | null = undefined;

    if (domainEntity.image) {
      image = new FileEntity();
      image.id = domainEntity.image.id;
      image.path = domainEntity.image.path;
    } else if (domainEntity.image === null) {
      image = null;
    }
    persistenceEntity.image = image;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
