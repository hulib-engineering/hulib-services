import { FileEntity } from '@files/infrastructure/persistence/relational/entities/file.entity';
import { RoleEntity } from '@roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '@statuses/infrastructure/persistence/relational/entities/status.entity';
import { User } from '@users/domain/user';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { GenderEntity } from '@genders/infrastructure/persistence/relational/entities/gender.entity';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { TopicsMapper } from '@topics/infrastructure/persistence/relational/mappers/topics.mapper';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';
import { FileMapper } from '@files/infrastructure/persistence/relational/mappers/file.mapper';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();

    if (raw.topics) {
      domainEntity.topics = raw.topics.map((topic) =>
        TopicsMapper.toDomain(topic),
      );
    }

    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.previousPassword = raw.previousPassword;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.fullName = raw.fullName;
    domainEntity.birthday = raw.birthday;

    if (raw.photo) {
      domainEntity.photo = FileMapper.toDomain(raw.photo);
    }

    domainEntity.gender = raw.gender;
    domainEntity.role = raw.role;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.address = raw.address;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.parentPhoneNumber = raw.parentPhoneNumber;
    domainEntity.bio = raw.bio;
    domainEntity.videoUrl = raw.videoUrl;
    domainEntity.education = raw.education;
    domainEntity.educationStart = raw.educationStart;
    domainEntity.educationEnd = raw.educationEnd;
    domainEntity.topics = raw.topics;
    domainEntity.countTopics = raw.countTopics;
    domainEntity.approval = raw.approval;
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

    let topics: TopicsEntity[] | undefined | null = undefined;

    if (domainEntity.topics) {
      topics = domainEntity.topics.map((topic) => {
        const topicEntity = new TopicsEntity();
        topicEntity.id = topic.id;
        return topicEntity;
      });
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
    persistenceEntity.deletedAt = null;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.parentPhoneNumber = domainEntity.parentPhoneNumber;
    persistenceEntity.bio = domainEntity.bio;
    persistenceEntity.videoUrl = domainEntity.videoUrl;
    persistenceEntity.education = domainEntity.education;
    persistenceEntity.educationStart = domainEntity.educationStart;
    persistenceEntity.educationEnd = domainEntity.educationEnd;
    persistenceEntity.topics = topics;
    return persistenceEntity;
  }
}
