import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import { SessionService } from '@session/session.service';
import { MailService } from '@mail/mail.service';
import { TopicsService } from '@topics/topics.service';
import { FilesService } from '@files/files.service';
import { PrismaService } from '@prisma-client/prisma-client.service';
import bcrypt from 'bcryptjs';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthProvidersEnum } from './auth-providers.enum';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { Approval } from '@users/approval.enum';

const CONFIG_VALUES: Record<string, string> = {
  'auth.expires': '1d',
  'auth.secret': 'secret',
  'auth.refreshSecret': 'refresh-secret',
  'auth.refreshExpires': '7d',
  'auth.forgotExpires': '1h',
  'auth.forgotSecret': 'forgot-secret',
  'auth.confirmEmailSecret': 'confirm-secret',
  'auth.confirmEmailExpires': '1d',
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Record<string, jest.Mock>;
  let sessionService: Record<string, jest.Mock>;
  let mailService: Record<string, jest.Mock>;
  let topicsService: Record<string, jest.Mock>;
  let filesService: Record<string, jest.Mock>;
  let prisma: Record<string, any>;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  const makeJwtPayload = (overrides: Record<string, any> = {}) => ({
    id: 1,
    role: { id: RoleEnum.reader },
    sessionId: 10,
    iat: 1700000000,
    exp: 1700604800,
    ...overrides,
  });

  const makeUser = (overrides: Record<string, any> = {}) => ({
    id: 1,
    email: 'user@example.com',
    password: 'hashed-password',
    provider: AuthProvidersEnum.email,
    fullName: 'User',
    role: { id: RoleEnum.reader },
    status: { id: StatusEnum.active },
    ...overrides,
  });

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findBySocialIdAndProvider: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      remove: jest.fn(),
    };
    sessionService = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteByUserIdWithExclude: jest.fn(),
      deleteById: jest.fn(),
    };
    mailService = {
      userSignUp: jest.fn(),
      forgotPassword: jest.fn(),
      confirmNewEmail: jest.fn(),
    };
    topicsService = { findOne: jest.fn() };
    filesService = { findById: jest.fn() };
    prisma = {};
    jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
    configService = {
      getOrThrow: jest.fn((key: string) => CONFIG_VALUES[key]),
    };

    service = new AuthService(
      jwtService as unknown as JwtService,
      usersService as unknown as UsersService,
      sessionService as unknown as SessionService,
      mailService as unknown as MailService,
      configService as unknown as ConfigService,
      topicsService as unknown as TopicsService,
      prisma as unknown as PrismaService,
      filesService as unknown as FilesService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateLogin', () => {
    beforeEach(() => {
      jwtService.signAsync.mockResolvedValue('signed-token');
    });

    it('should throw when the email is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateLogin({
          email: 'nobody@example.com',
          password: 'x',
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the account was registered via a social provider', async () => {
      usersService.findByEmail.mockResolvedValue(
        makeUser({ provider: 'google', password: null }),
      );

      await expect(
        service.validateLogin({ email: 'u@e.com', password: 'x' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the account has no password', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ password: null }));

      await expect(
        service.validateLogin({ email: 'u@e.com', password: 'x' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.validateLogin({ email: 'u@e.com', password: 'wrong' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should reject inactive accounts', async () => {
      usersService.findByEmail.mockResolvedValue(
        makeUser({ status: { id: StatusEnum.inactive } }),
      );
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        service.validateLogin({ email: 'u@e.com', password: 'ok' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create a session and return tokens on success', async () => {
      const user = makeUser();
      usersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      sessionService.create.mockResolvedValue({ id: 42 });

      const result = await service.validateLogin({
        email: 'user@example.com',
        password: 'ok',
      } as any);

      expect(sessionService.create).toHaveBeenCalledWith({
        user,
        hash: expect.any(String),
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(configService.getOrThrow).toHaveBeenCalledWith('auth.expires', {
        infer: true,
      });
      expect(result).toEqual(
        expect.objectContaining({
          user,
          token: 'signed-token',
          refreshToken: 'signed-token',
          tokenExpires: expect.any(Number),
        }),
      );
    });
  });

  describe('register', () => {
    it('should create an inactive reader and mail the otp code', async () => {
      usersService.create.mockResolvedValue({ id: 7 });

      const result = await service.register({
        email: 'u@example.com',
        fullName: 'User',
        gender: { id: 1 },
      } as any);

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'u@example.com',
        fullName: 'User',
        gender: { id: 1 },
        role: { id: RoleEnum.reader },
        status: { id: StatusEnum.inactive },
      });
      expect(mailService.userSignUp).toHaveBeenCalledWith({
        to: 'u@example.com',
        data: { code: expect.any(Number), name: 'User' },
      });
      expect(result).toEqual({
        id: 7,
        email: 'u@example.com',
        code: expect.stringMatching(/^\d{6}$/),
      });
    });
  });

  describe('confirmEmail', () => {
    it('should throw when the user is not in the inactive state', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.confirmEmail(1)).rejects.toThrow(NotFoundException);
    });

    it('should activate a newly registered user', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ status: { id: StatusEnum.inactive } }),
      );
      usersService.update.mockResolvedValue(null);

      await service.confirmEmail(1);

      expect(usersService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: { id: StatusEnum.active },
        }),
      );
    });
  });

  describe('checkEmailExisted', () => {
    it('should report availability when the email is free', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.checkEmailExisted('a@b.com')).resolves.toEqual({
        emailAvailable: true,
      });
    });

    it('should report that it exists otherwise', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());

      await expect(service.checkEmailExisted('a@b.com')).resolves.toEqual({
        emailAvailable: false,
      });
    });
  });

  describe('resendOTP', () => {
    it('should throw when the user is unknown', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.resendOTP(1)).rejects.toThrow(NotFoundException);
    });

    it('should resend the otp by mail', async () => {
      usersService.findById.mockResolvedValue(makeUser({ email: 'u@e.com' }));

      const result = await service.resendOTP(1);

      expect(mailService.userSignUp).toHaveBeenCalledWith({
        to: 'u@e.com',
        data: { code: expect.any(Number), name: 'User' },
      });
      expect(result.code).toMatch(/^\d{6}$/);
    });
  });

  describe('forgotPassword', () => {
    it('should throw when the email does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('a@b.com')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should sign a reset token and mail it', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());
      jwtService.signAsync.mockResolvedValue('reset-token');

      await service.forgotPassword('user@example.com');

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { forgotUserId: 1 },
        {
          secret: 'forgot-secret',
          expiresIn: '1h',
        },
      );
      expect(mailService.forgotPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          data: expect.objectContaining({
            hash: 'reset-token',
            name: 'User',
            tokenExpiresIn: '1h',
          }),
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw when the token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.resetPassword('hash', 'pw')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw when the user was not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({ forgotUserId: 9 });
      usersService.findById.mockResolvedValue(null);

      await expect(service.resetPassword('hash', 'pw')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should clear all sessions and update the password', async () => {
      jwtService.verifyAsync.mockResolvedValue({ forgotUserId: 1 });
      usersService.findById.mockResolvedValue(makeUser());

      await service.resetPassword('hash', 'new-password');

      expect(sessionService.deleteByUserId).toHaveBeenCalledWith({ userId: 1 });
      expect(usersService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: 'new-password' }),
      );
    });
  });

  describe('me', () => {
    it('should return the current user', async () => {
      const user = makeUser();
      usersService.findById.mockResolvedValue(user);

      await expect(service.me(makeJwtPayload())).resolves.toEqual(user);
      expect(usersService.findById).toHaveBeenCalledWith(1);
    });

    it('should rethrow underlying failures', async () => {
      usersService.findById.mockRejectedValue(new Error('boom'));

      await expect(service.me(makeJwtPayload())).rejects.toThrow('boom');
    });
  });

  describe('getMyAvatar', () => {
    it('should throw when the user does not exist', async () => {
      prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };

      await expect(service.getMyAvatar(1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should return null when there is no photo', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue({ id: 1, photoId: null }),
      };

      await expect(service.getMyAvatar(1)).resolves.toBeNull();
      expect(filesService.findById).not.toHaveBeenCalled();
    });

    it('should resolve the avatar file', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue({ id: 1, photoId: 'file-1' }),
      };
      filesService.findById.mockResolvedValue({ id: 'file-1', path: '/a.png' });

      await expect(service.getMyAvatar(1)).resolves.toEqual({
        id: 'file-1',
        path: '/a.png',
      });
    });
  });

  describe('update', () => {
    it('should throw when the current user is missing', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.update(makeJwtPayload(), {} as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should require the old password when setting a new password', async () => {
      usersService.findById.mockResolvedValue(makeUser());

      await expect(
        service.update(makeJwtPayload(), { password: 'new' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should validate the old password and revoke other sessions', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      usersService.update.mockResolvedValue(makeUser());

      await service.update(makeJwtPayload(), {
        password: 'new',
        oldPassword: 'old',
      } as any);

      expect(bcrypt.compare).toHaveBeenCalledWith('old', 'hashed-password');
      expect(sessionService.deleteByUserIdWithExclude).toHaveBeenCalledWith({
        userId: 1,
        excludeSessionId: 10,
      });
    });

    it('should refuse a wrong old password', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.update(makeJwtPayload(), {
          password: 'new',
          oldPassword: 'wrong',
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the new email is already in use', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      usersService.findByEmail.mockResolvedValue(makeUser({ id: 2 }));

      await expect(
        service.update(makeJwtPayload(), { email: 'other@example.com' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should mail a confirmation when the email changes', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      usersService.findByEmail.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('confirm-hash');
      usersService.update.mockResolvedValue(makeUser());

      await service.update(makeJwtPayload(), {
        email: 'new@example.com',
      } as any);

      expect(mailService.confirmNewEmail).toHaveBeenCalledWith({
        to: 'new@example.com',
        data: { hash: 'confirm-hash' },
      });
      expect(usersService.update).toHaveBeenCalledWith(1, {});
    });

    it('should persist simple profile updates', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      usersService.update.mockResolvedValue(makeUser({ fullName: 'New' }));
      usersService.findById.mockResolvedValue(makeUser({ fullName: 'New' }));

      const result = await service.update(makeJwtPayload(), {
        fullName: 'New',
      } as any);

      expect(usersService.update).toHaveBeenCalledWith(1, { fullName: 'New' });
      expect(result).toEqual(expect.objectContaining({ fullName: 'New' }));
    });
  });

  describe('changePassword', () => {
    it('should throw when the passwords do not match', async () => {
      await expect(
        service.changePassword('1', {
          currentPassword: 'a',
          newPassword: 'b',
          confirmPassword: 'c',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the user is unknown', async () => {
      prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };

      await expect(
        service.changePassword('1', {
          currentPassword: 'a',
          newPassword: 'b',
          confirmPassword: 'b',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should refuse social login accounts', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          provider: 'google',
          password: null,
        }),
      };

      await expect(
        service.changePassword('1', {
          currentPassword: 'a',
          newPassword: 'b',
          confirmPassword: 'b',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when the current password is wrong', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          provider: 'email',
          password: 'hashed',
        }),
      };
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.changePassword('1', {
          currentPassword: 'wrong',
          newPassword: 'b',
          confirmPassword: 'b',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should hash the new password and persist it', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          provider: 'email',
          password: 'hashed',
        }),
      };
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed' as never);
      usersService.updatePassword.mockResolvedValue(undefined);

      await service.changePassword('1', {
        currentPassword: 'old',
        newPassword: 'new-pass',
        confirmPassword: 'new-pass',
      });

      expect(usersService.updatePassword).toHaveBeenCalledWith(
        '1',
        'new-hashed',
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw when the session is gone', async () => {
      sessionService.findById.mockResolvedValue(null);

      await expect(
        service.refreshToken({ sessionId: 1, hash: 'h' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when the hash does not match', async () => {
      sessionService.findById.mockResolvedValue({
        id: 1,
        hash: 'expected',
        user: { id: 1 },
      });

      await expect(
        service.refreshToken({ sessionId: 1, hash: 'other' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate the session hash and reissue tokens', async () => {
      sessionService.findById.mockResolvedValue({
        id: 1,
        hash: 'expected',
        user: { id: 1 },
      });
      usersService.findById.mockResolvedValue(makeUser());
      jwtService.signAsync.mockResolvedValue('signed-token');
      sessionService.update.mockResolvedValue({ id: 1 });

      const result = await service.refreshToken({
        sessionId: 1,
        hash: 'expected',
      });

      expect(sessionService.update).toHaveBeenCalledWith(1, {
        hash: expect.any(String),
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        expect.objectContaining({
          token: 'signed-token',
          refreshToken: 'signed-token',
        }),
      );
    });
  });

  describe('softDelete / logout', () => {
    it('should remove the user', async () => {
      usersService.remove.mockResolvedValue(undefined);

      await service.softDelete(makeUser() as any);

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('should delete the session', async () => {
      sessionService.deleteById.mockResolvedValue({ count: 1 });

      await service.logout({ sessionId: 5 });

      expect(sessionService.deleteById).toHaveBeenCalledWith(5);
    });
  });

  describe('upgradeAccout', () => {
    it('should throw when the user is missing', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.upgradeAccout(1)).rejects.toThrow(NotFoundException);
    });

    it('should confirm already-approved huber accounts', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ role: { id: RoleEnum.humanBook } }),
      );

      await expect(service.upgradeAccout(1)).resolves.toEqual({
        message: 'You have been approved to become a Human Book',
      });
    });

    it('should keep pending requests silent', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ approval: Approval.pending }),
      );

      await expect(service.upgradeAccout(1)).resolves.toEqual({
        message: expect.stringContaining('Wait for Admin approval'),
      });
    });

    it('should mark a new request as pending', async () => {
      usersService.findById.mockResolvedValue(makeUser({ approval: null }));
      usersService.update.mockResolvedValue(null);

      await expect(service.upgradeAccout(1)).resolves.toEqual({
        message: expect.stringContaining('Wait for Admin approval'),
      });

      expect(usersService.update).toHaveBeenCalledWith(1, {
        approval: Approval.pending,
      });
    });

    it('should return null when the request is already closed', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ approval: Approval.rejected }),
      );

      await expect(service.upgradeAccout(1)).resolves.toBeNull();
    });
  });

  describe('registerToHumanBook', () => {
    it('should throw when the user is missing', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.registerToHumanBook(1, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate topics and create a pending huber profile', async () => {
      const user = makeUser();
      usersService.findById.mockResolvedValue(user);
      usersService.update.mockResolvedValue({ id: 1 });
      topicsService.findOne.mockResolvedValue({ id: 3 });

      await service.registerToHumanBook(1, {
        topics: [{ id: 3 }],
        educationStart: '2020-01-01',
        educationEnd: '2024-01-01',
      } as any);

      expect(topicsService.findOne).toHaveBeenCalledWith(3, user);
      expect(usersService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          approval: Approval.pending,
          educationStart: new Date('2020-01-01'),
          educationEnd: new Date('2024-01-01'),
        }),
      );
    });
  });

  describe('getSession / verifySession', () => {
    it('should return null without a token', async () => {
      sessionService.findById.mockResolvedValue(null);

      await expect(service.getSession(undefined)).resolves.toBeNull();
    });

    it('should return null for a non-Bearer header', async () => {
      await expect(service.getSession('Basic abc')).resolves.toBeNull();
    });

    it('should return the payload when the session is live', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        id: 1,
        role: { id: 1 },
        sessionId: 10,
      });
      sessionService.findById.mockResolvedValue({ id: 10 });

      const result = await service.getSession('Bearer token');

      expect(result).toEqual(expect.objectContaining({ id: 1, sessionId: 10 }));
      expect(configService.getOrThrow).toHaveBeenCalledWith('auth.secret', {
        infer: true,
      });
    });

    it('should mirror getSession behaviour in verifySession', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        id: 1,
        role: { id: 1 },
        sessionId: 10,
      });
      sessionService.findById.mockResolvedValue({ id: 10 });

      await expect(service.verifySession('Bearer token')).resolves.toEqual(
        expect.objectContaining({ id: 1, sessionId: 10 }),
      );
    });
  });
});
