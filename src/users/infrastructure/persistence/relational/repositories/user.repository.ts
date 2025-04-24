import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { NullableType } from '@utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '@users/dto/query-user.dto';
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

  // async findManyWithPagination({
  //   filterOptions,
  //   sortOptions,
  //   paginationOptions,
  // }: {
  //   filterOptions?: FilterUserDto | null;
  //   sortOptions?: SortUserDto[] | null;
  //   paginationOptions: IPaginationOptions;
  // }): Promise<User[]> {
  //   const where: FindOptionsWhere<UserEntity> = {};
  //   if (filterOptions?.roles?.length) {
  //     where.role = filterOptions.roles.map((role) => ({
  //       id: role.id,
  //     }));
  //   }

  //   if (filterOptions?.topicsOfInterest?.length) {
  //     where.topics = filterOptions.topicsOfInterest.map((topicId) => ({
  //       id: topicId,
  //     }));
  //   }

  //   const entities = await this.usersRepository.find({
  //     skip: (paginationOptions.page - 1) * paginationOptions.limit,
  //     take: paginationOptions.limit,
  //     where: where,
  //     order: sortOptions?.reduce(
  //       (accumulator, sort) => ({
  //         ...accumulator,
  //         [sort.orderBy]: sort.order,
  //       }),
  //       {},
  //     ),
  //   });

  //   return entities.map((user) => UserMapper.toDomain(user));
  // }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {};

    // Kiểm tra và áp dụng điều kiện lọc theo role.id
    if (filterOptions?.roles?.length) {
      where.role = filterOptions.roles.map((role) => ({
        id: role.id, // Lọc theo role.id cụ thể
      }));
    }

    // Lọc theo các topic mà người dùng quan tâm
    if (filterOptions?.topicsOfInterest?.length) {
      where.topics = filterOptions.topicsOfInterest.map((topicId) => ({
        id: topicId,
      }));
    }

    // Truy vấn cơ sở dữ liệu
    const entities = await this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    // Chuyển đổi dữ liệu thành domain model (User)
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
