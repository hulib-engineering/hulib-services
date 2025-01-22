import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { GenderEnum } from '../genders/genders.enum';
import { GetAuthorDetailByIdDto } from './dto/get-author-detail-by-id.dto';
import { Action, Approval } from './approval.enum';
import { randomInt } from 'node:crypto';
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createProfileDto: CreateUserDto): Promise<User> {
    const clonedPayload = {
      approval: Approval.notRequested,
      provider: AuthProvidersEnum.email,
      ...createProfileDto,
    };

    if (clonedPayload.password) {
      const salt = await bcrypt.genSalt();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      const userObject = await this.usersRepository.findByEmail(
        clonedPayload.email,
      );
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
    }

    if (clonedPayload.photo?.id) {
      const fileObject = await this.filesService.findById(
        clonedPayload.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      clonedPayload.photo = fileObject;
    }

    if (clonedPayload.gender?.id) {
      const genderObject = Object.values(GenderEnum)
        .map(String)
        .includes(String(clonedPayload.gender.id));
      if (!genderObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'genderNotExists',
          },
        });
      }
    }

    if (clonedPayload.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(clonedPayload.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }
    }

    if (clonedPayload.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(clonedPayload.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }
    }

    return this.usersRepository.create(clonedPayload);
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null> {
    const clonedPayload = { ...payload };

    if (
      clonedPayload.password &&
      clonedPayload.previousPassword !== clonedPayload.password
    ) {
      const salt = await bcrypt.genSalt();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      const userObject = await this.usersRepository.findByEmail(
        clonedPayload.email,
      );

      if (userObject && userObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
    }

    // if (clonedPayload.photo?.id) {
    //   const fileObject = await this.filesService.findById(
    //     clonedPayload.photo.id,
    //   );
    //   if (!fileObject) {
    //     throw new UnprocessableEntityException({
    //       status: HttpStatus.UNPROCESSABLE_ENTITY,
    //       errors: {
    //         photo: 'imageNotExists',
    //       },
    //     });
    //   }
    //   clonedPayload.photo = fileObject;
    // }

    if (!!clonedPayload.role) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(clonedPayload.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }
    }

    if (!!clonedPayload.status) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(clonedPayload.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }
    }

    if (!!clonedPayload.gender) {
      const genderObject = Object.values(GenderEnum)
        .map(String)
        .includes(String(clonedPayload.gender.id));
      if (!genderObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'genderNotExists',
          },
        });
      }
    }

    return this.usersRepository.update(id, clonedPayload);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }

  async getAuthorDetailById(
    id: string | number,
  ): Promise<GetAuthorDetailByIdDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          confirmPassword: 'userNotFound',
        },
      });
    }
    // ignore password & previousPassword
    delete user.password;
    delete user.previousPassword;
    return user;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.usersRepository.update(userId, { password: newPassword });
  }

  // async upgrade(id: User['id'], action: string): Promise<void> {
  //   console.log(action);
  //   const code = randomInt(100000, 999999);

  //   if (action === Action.accept) {
  //     await this.usersRepository.update(id, {
  //       role: {
  //         id: RoleEnum.humanBook,
  //       },
  //       approval: Approval.approved,
  //     });
  //   } else if (action === Action.reject) {
  //     await this.usersRepository.update(id, {
  //       approval: Approval.rejected,
  //     });
  //   } else {
  //     throw new BadRequestException({
  //       status: HttpStatus.BAD_REQUEST,
  //       errors: {
  //         action: 'invalidAction',
  //       },
  //     });
  //   }
  // }
  async upgrade(
    id: User['id'],
    action: string,
  ): Promise<{ approval: Approval; message: string; code: number }> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    const code = randomInt(100000, 999999);

    switch (action) {
      case Action.accept:
        if (user.approval === Approval.approved) {
          return {
            approval: Approval.approved,
            message: 'User has already been approved.',
            code,
          };
        }

        await this.usersRepository.update(id, {
          role: { id: RoleEnum.humanBook },
          approval: Approval.approved,
        });

        return {
          approval: Approval.approved,
          message: 'User has been successfully approved.',
          code,
        };

      case Action.reject:
        if (user.approval === Approval.rejected) {
          return {
            approval: Approval.rejected,
            message: 'User has already been rejected.',
            code,
          };
        }

        await this.usersRepository.update(id, {
          approval: Approval.rejected,
        });

        return {
          approval: Approval.rejected,
          message: 'User has been successfully rejected.',
          code,
        };

      default:
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            action: 'invalidAction',
          },
        });
    }
  }
}
