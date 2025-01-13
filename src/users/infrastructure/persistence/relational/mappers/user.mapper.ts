import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';
// import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';
import { GenderEntity } from '../../../../../genders/infrastructure/persistence/relational/entities/gender.entity';
import { RoleEnum } from '../../../../../roles/roles.enum';
import { StatusEnum } from '../../../../../statuses/statuses.enum';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.previousPassword = raw.previousPassword;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.fullName = raw.fullName;
    domainEntity.birthday = raw.birthday;
    // if (raw.photo) {
    //   domainEntity.photo = FileMapper.toDomain(raw.photo);
    // }
    if (raw.approval) {
      domainEntity.approval = raw.approval;
    }
    domainEntity.gender = raw.gender;
    domainEntity.role = raw.role;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.address = raw.address;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.parentPhoneNumber = raw.parentPhoneNumber;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    let gender: GenderEntity | undefined = undefined;

    if (domainEntity.gender) {
      gender = new GenderEntity();
      gender.id = Number(domainEntity.gender.id);
      gender.name = RoleEnum[String(gender.id)];
    }

    let approval: string | null | undefined = undefined;

    if (domainEntity.approval) {
      approval = domainEntity.approval;
    }

    let role: RoleEntity | undefined = undefined;

    if (domainEntity.role) {
      role = new RoleEntity();
      role.id = Number(domainEntity.role.id);
      role.name = RoleEnum[String(role.id)];
    }

    let photo: FileEntity | undefined | null = undefined;

    if (domainEntity.photo) {
      photo = new FileEntity();
      photo.id = domainEntity.photo.id;
      photo.path = domainEntity.photo.path;
    } else if (domainEntity.photo === null) {
      photo = null;
    }

    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
      status.name = StatusEnum[String(status.id)];
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.previousPassword = domainEntity.previousPassword;
    persistenceEntity.provider = domainEntity.provider;
    persistenceEntity.socialId = domainEntity.socialId;
    persistenceEntity.fullName = domainEntity.fullName;
    persistenceEntity.birthday = domainEntity.birthday;
    persistenceEntity.photo = photo;
    persistenceEntity.gender = gender;
    persistenceEntity.role = role;
    persistenceEntity.status = status;
    persistenceEntity.approval = approval || null;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.parentPhoneNumber = domainEntity.parentPhoneNumber;
    return persistenceEntity;
  }
}
