import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '@utils/types/nullable.type';
import { FilterUserDto, QueryUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '@auth/auth-providers.enum';
import { FilesService } from '@files/files.service';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { DeepPartial } from '@utils/types/deep-partial.type';
import { GenderEnum } from '@genders/genders.enum';
import { Action, Approval } from '@users/approval.enum';
import { CreateFeedbackDto } from '@users/dto/create-feedback.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { user as PrismaUser } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
    private readonly prisma: PrismaService,
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
    filterOptions?: (FilterUserDto & Pick<QueryUserDto, 'role'>) | null;
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

  // async findHumanBookById(id: User['id']): Promise<NullableType<User>> {
  //   const humanBook = await this.usersRepository.findHumanBookById(id);
  //
  //   if (!humanBook) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         user: 'humanBookNotFound',
  //       },
  //     });
  //   }
  //
  //   return humanBook;
  // }

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

  updateStatus(id: User['id'], status: string) {
    const isExistStatus = Object.keys(StatusEnum).includes(status);
    if (!isExistStatus) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'statusNotExists',
        },
      });
    }
    return this.usersRepository.update(id, {
      status: { id: StatusEnum[status] },
    });
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }

  // async getAuthorDetailById(
  //   id: string | number,
  // ): Promise<GetAuthorDetailByIdDto> {
  //   const user = await this.usersRepository.findById(id);
  //
  //   if (!user) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         confirmPassword: 'userNotFound',
  //       },
  //     });
  //   }
  //   // ignore password & previousPassword
  //   delete user.password;
  //   delete user.previousPassword;
  //   return user;
  // }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.usersRepository.update(userId, { password: newPassword });
  }

  async upgrade(id: User['id'], action: string): Promise<void> {
    if (action === Action.accept) {
      await this.usersRepository.update(id, {
        role: {
          id: RoleEnum.humanBook,
        },
        approval: Approval.approved,
      });
    } else if (action === Action.reject) {
      await this.usersRepository.update(id, {
        approval: Approval.rejected,
      });
    } else {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          action: 'invalidAction',
        },
      });
    }
  }

  async addFeedback(
    byId: PrismaUser['id'],
    toId: PrismaUser['id'],
    payload: Omit<CreateFeedbackDto, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ) {
    return this.prisma.user.update({
      where: { id: byId },
      data: {
        feedbackBys: {
          create: { ...payload, feedbackTo: { connect: { id: toId } } },
        },
      },
    });
  }

  async getFeedback(byId: PrismaUser['id'], toId: PrismaUser['id']) {
    return this.prisma.user.findFirst({
      include: {
        feedbackBys: {
          where: {
            feedbackById: byId,
          },
        },
        feedbackTos: {
          where: {
            feedbackToId: toId,
          },
        },
      },
    });
  }

  async editFeedback(
    byId: PrismaUser['id'],
    toId: PrismaUser['id'],
    payload: Pick<CreateFeedbackDto, 'rating' | 'content'>,
  ) {
    const feedback = await this.getFeedback(byId, toId);
    return this.prisma.feedback.update({
      where: { id: feedback?.id || 0 },
      data: { rating: payload.rating, content: payload.content },
    });
  }
}
