import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';

import { SocialInterface } from '@social/interfaces/social.interface';
import { NullableType } from '@utils/types/nullable.type';
import { UsersService } from '@users/users.service';
import { AllConfigType } from '@config/config.type';
import { MailService } from '@mail/mail.service';
import { RoleEnum } from '@roles/roles.enum';
import { Session } from '@session/domain/session';
import { SessionService } from '@session/session.service';
import { StatusEnum } from '@statuses/statuses.enum';
import { User } from '@users/domain/user';
import { Approval } from '@users/approval.enum';
import { TopicsService } from '@topics/topics.service';
import { PrismaService } from '@prisma-client/prisma-client.service';

import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthProvidersEnum } from './auth-providers.enum';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterToHumanBookDto } from './dto/register-to-humanbook';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
    private topicsService: TopicsService,
    private prisma: PrismaService,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: `needLoginViaProvider:${user.provider}`,
        },
      });
    }

    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    if (user.status?.id === StatusEnum.inactive) {
      throw new UnauthorizedException();
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<User> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<User> = null;

    if (socialEmail) {
      userByEmail = await this.usersService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.usersService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.usersService.update(user.id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      const role = {
        id: RoleEnum.reader,
      };
      const status = {
        id: StatusEnum.active,
      };

      user = await this.usersService.create({
        email: socialEmail ?? null,
        fullName: `${socialData.firstName || ''} ${socialData.lastName || ''}`,
        socialId: socialData.id,
        provider: authProvider,
        role,
        status,
      });

      user = await this.usersService.findById(user.id);
    }

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<RegisterResponseDto> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
      gender: {
        id: dto.gender.id,
      },
      role: {
        id: RoleEnum.reader,
      },
      status: {
        id: StatusEnum.inactive,
      },
    });

    const code = randomInt(100000, 999999);

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        code,
        name: dto.fullName,
      },
    });

    return { id: user.id, email: dto.email, code: code.toString() };
  }

  async confirmEmail(id: string | number): Promise<void> {
    const user = await this.usersService.findById(id);

    if (
      !user ||
      user?.status?.id?.toString() !== StatusEnum.inactive.toString()
    ) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.status = {
      id: StatusEnum.active,
    };

    await this.usersService.update(user.id, user);
  }

  async checkEmailExisted(email: string): Promise<void> {
    const userObject = await this.usersService.findByEmail(email);
    if (userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailAlreadyExists',
        },
      });
    }
  }

  async resendOTP(id: string | number): Promise<RegisterResponseDto> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    const code = randomInt(100000, 999999);

    await this.mailService.userSignUp({
      to: user.email || '',
      data: {
        name: user.fullName || '',
        code,
      },
    });

    return { id, email: user.email ?? '', code: code.toString() };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        name: user.fullName,
        hash,
        tokenExpires,
        tokenExpiresIn,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      });
    }

    user.password = password;

    await this.sessionService.deleteByUserId({
      userId: user.id,
    });

    await this.usersService.update(user.id, user);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findById(userJwtPayload.id);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const currentUser = await this.usersService.findById(userJwtPayload.id);

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword',
          },
        });
      }

      if (!currentUser.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      }

      const isValidOldPassword = await bcrypt.compare(
        userDto.oldPassword,
        currentUser.password,
      );

      if (!isValidOldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      } else {
        await this.sessionService.deleteByUserIdWithExclude({
          userId: currentUser.id,
          excludeSessionId: userJwtPayload.sessionId,
        });
      }
    }

    if (userDto.email && userDto.email !== currentUser.email) {
      const userByEmail = await this.usersService.findByEmail(userDto.email);

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailExists',
          },
        });
      }

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser.id,
          newEmail: userDto.email,
        },
        {
          secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
            infer: true,
          }),
        },
      );

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash,
        },
      });
    }

    delete userDto.email;
    delete userDto.oldPassword;

    await this.usersService.update(userJwtPayload.id, userDto);

    return this.usersService.findById(userJwtPayload.id);
  }

  async changePassword(
    userId: string,
    newPasswordDto: AuthChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = newPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          confirmPassword: 'incorrectConfirmPassword',
        },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          confirmPassword: 'userNotFound',
        },
      });
    }

    if (user.provider !== 'email') {
      throw new BadRequestException(
        'Social login accounts do not support password changes',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password!,
    );

    if (!isCurrentPasswordValid) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          confirmPassword: 'incorrectCurrentPasswordValid',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.usersService.findById(session.user.id);

    if (!user?.role) {
      throw new UnauthorizedException();
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: {
        id: user.role.id,
      },
      sessionId: session.id,
      hash,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.remove(user.id);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId);
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async upgradeAccout(
    userId: User['id'],
  ): Promise<User | { message: string } | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    if (user.role?.id === RoleEnum.humanBook) {
      return {
        message: 'You have been approved to become a Human Book',
      };
    }
    if (user.approval === Approval.pending) {
      return {
        message:
          'You have registered to become a Human Book. Wait for Admin approval!',
      };
    }
    try {
      if (!user.approval || user.approval === Approval.notRequested) {
        await this.usersService.update(userId, {
          approval: Approval.pending,
        });
        return {
          message:
            'You have registered to become a Human Book. Wait for Admin approval!',
        };
      }
      return null;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async registerToHumanBook(
    userId: User['id'],
    createHumanBooksDto: RegisterToHumanBookDto,
  ): Promise<User | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    createHumanBooksDto.topics?.forEach(async (topic) => {
      await this.topicsService.findOne(topic.id);
    });

    // TODO: check if user has already a human book
    // const humanBook = await this.humanBooksService.findByUserId(userId);
    // if (humanBook) {
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       humanBook: 'userAlreadyHasHumanBook',
    //     },
    //   });
    // }

    const educationStart = createHumanBooksDto.educationStart
      ? new Date(createHumanBooksDto.educationStart)
      : null;
    const educationEnd = createHumanBooksDto.educationEnd
      ? new Date(createHumanBooksDto.educationEnd)
      : null;

    return await this.usersService.update(userId, {
      ...user,
      ...createHumanBooksDto,
      educationStart,
      educationEnd,
      approval: Approval.pending,
      topics: createHumanBooksDto.topics ?? undefined,
    });
  }

  // async updateHumanBook(
  //   userId: User['id'],
  //   updateHumanBooksDto: UpdateHumanBooksDto,
  // ): Promise<User | null> {
  //   const user = await this.usersService.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException();
  //   }

  //   const educationStart = updateHumanBooksDto.educationStart
  //     ? new Date(updateHumanBooksDto.educationStart)
  //     : null;
  //   const educationEnd = updateHumanBooksDto.educationEnd
  //     ? new Date(updateHumanBooksDto.educationEnd)
  //     : null;

  //   return await this.usersService.update(userId, {
  //     ...user,
  //     ...updateHumanBooksDto,
  //     educationStart: educationStart,
  //     educationEnd: educationEnd,
  //   });
  // }

  async getSession(headerToken?: string) {
    if (!headerToken) {
      return null;
    }
    const [type, token] = headerToken.split(' ') ?? [];
    if (type !== 'Bearer') {
      return null;
    }

    const payload = await this.jwtService.verifyAsync<{
      id: User['id'];
      role: User['role'];
      sessionId: Session['id'];
    }>(token, {
      secret: this.configService.getOrThrow('auth.secret', {
        infer: true,
      }),
    });

    if (!payload.id || !payload.sessionId) {
      return null;
    }

    const session = await this.sessionService.findById(payload.sessionId);

    if (!session) {
      return null;
    }

    return payload;
  }

  async verifySession(headerToken?: string) {
    if (!headerToken) {
      return null;
    }
    const [type, token] = headerToken.split(' ') ?? [];
    if (type !== 'Bearer') {
      return null;
    }

    const payload = await this.jwtService.verifyAsync<{
      id: User['id'];
      role: User['role'];
      sessionId: Session['id'];
    }>(token, {
      secret: this.configService.getOrThrow('auth.secret', {
        infer: true,
      }),
    });

    if (!payload.id || !payload.sessionId) {
      return null;
    }

    const session = await this.sessionService.findById(payload.sessionId);

    if (!session) {
      return null;
    }

    return payload;
  }
}
