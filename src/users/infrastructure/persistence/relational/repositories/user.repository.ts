import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { NullableType } from '@utils/types/nullable.type';
import {
  FilterUserDto,
  QueryUserDto,
  SortUserDto,
} from '@users/dto/query-user.dto';
import { User } from '@users/domain/user';
import { UserRepository } from '@users/infrastructure/persistence/user.repository';
import { UserMapper } from '@users/infrastructure/persistence/relational/mappers/user.mapper';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { RoleEnum } from '@roles/roles.enum';

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );
    return UserMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: (FilterUserDto & Pick<QueryUserDto, 'role'>) | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    queryBuilder
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.gender', 'gender')
      .leftJoinAndSelect('user.photo', 'photo')
      .leftJoinAndSelect('user.topics', 'topics');

    if (filterOptions?.role) {
      queryBuilder.andWhere('user.roleId = :roleId', {
        roleId:
          filterOptions.role === 'huber' ? RoleEnum.humanBook : RoleEnum.reader,
      });
    }

    if (
      filterOptions?.topicsOfInterest &&
      filterOptions?.topicsOfInterest?.length
    ) {
      queryBuilder.innerJoin(
        'user.topics',
        'topic',
        'topic.id IN (:...topicIds)',
        {
          topicIds: filterOptions.topicsOfInterest,
        },
      );
    }

    queryBuilder
      .addSelect(
        `CASE WHEN user.approval = 'Pending' THEN 0 ELSE 1 END`,
        'approval_priority',
      )
      .orderBy('approval_priority', 'ASC');

    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sort) => {
        queryBuilder.addOrderBy(
          `user.${sort.orderBy}`,
          sort.order.toUpperCase() as 'ASC' | 'DESC',
        );
      });
    }

    queryBuilder.skip((paginationOptions.page - 1) * paginationOptions.limit);
    queryBuilder.take(paginationOptions.limit);

    const entities = await queryBuilder.getMany();
    return entities.map((user) => UserMapper.toDomain(user));
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
      relations: {
        topics: true,
      },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const entity = await this.usersRepository.findOne({
      where: { email },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;

    const entity = await this.usersRepository.findOne({
      where: { socialId, provider },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('User not found');
    }

    const updatedEntity = await this.usersRepository.save(
      this.usersRepository.create(
        UserMapper.toPersistence({
          ...UserMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return UserMapper.toDomain(updatedEntity);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async findHumanBookById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id), role: { id: RoleEnum.humanBook } },
      relations: {
        topics: true,
      },
    });

    if (!entity) return null;

    return UserMapper.toDomain(entity);
  }
}
