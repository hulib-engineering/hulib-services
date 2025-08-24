import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
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
import { UpgradeDto } from '@users/dto/upgrade.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';
import { pagination } from '@utils/types/pagination';
import { PublishStatus } from '@stories/status.enum';
import { FileDto } from '@files/dto/file.dto';
import fileConfig from '@files/config/file.config';
import { FileConfig, FileDriver } from '@files/config/file-config.type';
import appConfig from '@config/app.config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AppConfig } from '@config/app-config.type';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ReadingSessionStatus } from '../reading-sessions/domain';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
    private readonly notificationsService: NotificationsService,
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

  async findById(id: User['id']): Promise<NullableType<any>> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        humanBookTopic: {
          include: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        topicsOfInterest: {
          include: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        gender: true,
        role: true,
        status: true,
        file: true,
      },
      omit: {
        deletedAt: true,
        genderId: true,
        roleId: true,
        statusId: true,
        photoId: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const mappedHumanBookTopic = user.humanBookTopic
      ? user.humanBookTopic.map((item) => item.topic)
      : [];

    const mappedTopicsOfInterest = user.topicsOfInterest
      ? user.topicsOfInterest.map((item) => item.topic)
      : [];

    const isLiber = user.role?.id === RoleEnum.reader;

    if (isLiber) {
      const firstStory = await this.prisma.story.findFirst({
        where: {
          humanBookId: Number(id),
        },
        include: {
          cover: true,
        },
        omit: {
          coverId: true,
          createdAt: true,
          updatedAt: true,
          humanBookId: true,
        },
      });
      return {
        ...user,
        photo: this.transformFileUrl(user.file),
        sharingTopics: mappedHumanBookTopic,
        topicsOfInterest: mappedTopicsOfInterest,
        firstStory,
      };
    }

    return {
      ...user,
      photo: this.transformFileUrl(user.file),
      sharingTopics: mappedHumanBookTopic,
      topicsOfInterest: mappedTopicsOfInterest,
    };
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

  async updateStatus(id: User['id'], status: string) {
    const statusValue = StatusEnum[status as keyof typeof StatusEnum];
    if (!statusValue) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { status: 'statusNotExists' },
      });
    }

    const userConfig = {
      include: {
        gender: true,
        role: true,
        status: true,
      },
      omit: {
        deletedAt: true,
        genderId: true,
        roleId: true,
        statusId: true,
        photoId: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    const userExist = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });
    if (!userExist) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { user: 'userNotFound' },
      });
    }

    if (statusValue === StatusEnum.inactive) {
      const [user] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: Number(id) },
          data: { statusId: statusValue },
          ...userConfig,
        }),
        this.prisma.story.updateMany({
          where: { humanBookId: Number(id) },
          data: {
            publishStatus: PublishStatus.deleted,
          },
        }),
      ]);
      return user;
    }

    return this.prisma.user.update({
      where: { id: Number(id) },
      data: { statusId: statusValue },
      ...userConfig,
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

  async upgrade(id: User['id'], upgradeDto: UpgradeDto) {
    if (upgradeDto.action === Action.accept) {
      await this.usersRepository.update(id, {
        role: {
          id: RoleEnum.humanBook,
        },
        approval: Approval.approved,
      });
      await this.notificationsService.pushNoti({
        senderId: 1,
        recipientId: Number(id),
        type: NotificationTypeEnum.account,
      });

      // change status for the first story when becoming a human book
      await this.prisma.story.updateMany({
        where: { humanBookId: Number(id) },
        data: { publishStatus: PublishStatus.published },
      });

      return {
        message: 'Approve request to become huber successfully.',
      };
    } else if (upgradeDto.action === Action.reject) {
      await this.usersRepository.update(id, {
        approval: Approval.rejected,
      });

      await this.notificationsService.pushNoti({
        senderId: 1,
        recipientId: Number(id),
        type: NotificationTypeEnum.rejectHuber,
        extraNote: upgradeDto.reason,
      });

      return {
        message: 'Reject request to become huber!',
      };
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

  async getReadingSessions({
    userId,
    status,
    paginationOptions,
  }: {
    userId: User['id'];
    status: ReadingSessionStatus;
    paginationOptions: IPaginationOptions;
  }) {
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;
    const where = {
      AND: [
        {
          OR: [{ humanBookId: Number(userId) }, { readerId: Number(userId) }],
        },
        { sessionStatus: status },
      ],
    };
    const userConfig = {
      include: {
        topicsOfInterest: true,
        gender: true,
        role: true,
        status: true,
      },
      omit: {
        deletedAt: true,
        genderId: true,
        roleId: true,
        statusId: true,
        photoId: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    const [totalItems, data] = await this.prisma.$transaction([
      this.prisma.readingSession.count({ where }),
      this.prisma.readingSession.findMany({
        where,
        include: {
          humanBook: userConfig,
          reader: userConfig,
        },
        omit: {
          readerId: true,
          humanBookId: true,
          sessionUrl: true,
          recordingUrl: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        skip,
        take,
      }),
    ]);

    return pagination(data, totalItems, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
    });
  }

  private async transformFileUrl(
    file: FileDto | null,
  ): Promise<FileDto | null> {
    if (!file) return file;

    const config = fileConfig() as FileConfig;

    if (config.driver === FileDriver.LOCAL) {
      file.path = (appConfig() as AppConfig).backendDomain + file.path;
    } else if (
      [FileDriver.S3, FileDriver.S3_PRESIGNED].includes(config.driver)
    ) {
      if (!file.path) {
        throw new BadRequestException('Missing file path for S3 object.');
      }

      const s3 = new S3Client({
        region: config.awsS3Region ?? '',
        credentials: {
          accessKeyId: config.accessKeyId ?? '',
          secretAccessKey: config.secretAccessKey ?? '',
        },
      });

      const command = new GetObjectCommand({
        Bucket: config.awsDefaultS3Bucket,
        Key: file.path,
      });

      file.path = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    return file;
  }
}
