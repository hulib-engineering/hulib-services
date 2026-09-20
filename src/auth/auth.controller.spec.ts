import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FavStoriesService } from '@fav-stories/fav-stories.service';
import { UserFavoriteHuberService } from '../fav-hubers/fav-hubers.service';
import { UsersService } from '@users/users.service';
import { CaslAbilityFactory } from '@permission/ability.factory';
import {
  makeAbilityFactoryStub,
  FakeAbility,
} from '@permission/permission.fixtures.spec-helpers';

describe('AuthController', () => {
  let controller: AuthController;
  let service: Record<string, jest.Mock>;
  let favStoriesService: Record<string, jest.Mock>;
  let userFavoriteHuberService: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      validateLogin: jest.fn(),
      register: jest.fn(),
      checkEmailExisted: jest.fn(),
      confirmEmail: jest.fn(),
      resendOTP: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
      me: jest.fn(),
      getMyAvatar: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      update: jest.fn(),
      upgradeAccout: jest.fn(),
      registerToHumanBook: jest.fn(),
    };
    favStoriesService = {
      getFavoriteStories: jest.fn(),
      addToFavorites: jest.fn(),
      removeAllFavoriteStories: jest.fn(),
      removeFromFavorites: jest.fn(),
    };
    userFavoriteHuberService = {
      getFavoriteHubers: jest.fn(),
      add: jest.fn(),
      removeAll: jest.fn(),
      removeFavorite: jest.fn(),
    };
    usersService = {
      addEducation: jest.fn(),
      updateTopics: jest.fn(),
      addWork: jest.fn(),
      updateEducation: jest.fn(),
      updateWork: jest.fn(),
      deleteEducation: jest.fn(),
      deleteWork: jest.fn(),
      markHuberOnboardingSeen: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: FavStoriesService, useValue: favStoriesService },
        {
          provide: UserFavoriteHuberService,
          useValue: userFavoriteHuberService,
        },
        { provide: UsersService, useValue: usersService },
        { provide: Reflector, useValue: new Reflector() },
        {
          provide: CaslAbilityFactory,
          useValue: makeAbilityFactoryStub(new FakeAbility()),
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  describe('email lifecycle', () => {
    it('should attempt the login', async () => {
      const dto = { email: 'a@b.com', password: 'x' };
      service.validateLogin.mockResolvedValue({ token: 't' });

      await expect(controller.login(dto as any)).resolves.toEqual({
        token: 't',
      });
      expect(service.validateLogin).toHaveBeenCalledWith(dto);
    });

    it('should register and return the queued profile', async () => {
      const dto = { email: 'a@b.com', fullName: 'A' };
      service.register.mockResolvedValue({ id: 1 });

      await expect(controller.register(dto as any)).resolves.toEqual({
        id: 1,
      });
      expect(service.register).toHaveBeenCalledWith(dto);
    });

    it('should validate the email', async () => {
      service.checkEmailExisted.mockResolvedValue({ emailAvailable: true });

      await expect(
        controller.validateEmail({ email: 'a@b.com' } as any),
      ).resolves.toEqual({ emailAvailable: true });
      await expect(
        controller.validateEmailByQuery({ email: 'a@b.com' } as any),
      ).resolves.toEqual({ emailAvailable: true });
    });

    it('should confirm the email', async () => {
      service.confirmEmail.mockResolvedValue(undefined);

      await controller.confirmEmail({ id: 5 } as any);

      expect(service.confirmEmail).toHaveBeenCalledWith(5);
    });

    it('should resend the otp', async () => {
      service.resendOTP.mockResolvedValue({ code: '123456' });

      await expect(controller.resendOTP({ id: 5 } as any)).resolves.toEqual({
        code: '123456',
      });
      expect(service.resendOTP).toHaveBeenCalledWith(5);
    });

    it('should send the forgot password email', async () => {
      service.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword({ email: 'a@b.com' } as any);

      expect(service.forgotPassword).toHaveBeenCalledWith('a@b.com');
    });

    it('should reset the password', async () => {
      service.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword({
        hash: 'h',
        password: 'p',
      } as any);

      expect(service.resetPassword).toHaveBeenCalledWith('h', 'p');
    });

    it('should change the password for the current user', async () => {
      service.changePassword.mockResolvedValue(undefined);
      const dto = {
        currentPassword: 'a',
        newPassword: 'b',
        confirmPassword: 'b',
      };

      await controller.changePassword({ user: { id: 3 } }, dto as any);

      expect(service.changePassword).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('me', () => {
    it('should load the current user', async () => {
      const user = { id: 1 };
      service.me.mockResolvedValue(user);

      await expect(controller.me({ user })).resolves.toEqual(user);
    });

    it('should load the avatar', async () => {
      service.getMyAvatar.mockResolvedValue({ path: '/a.png' });

      await expect(controller.getAvatar({ user: { id: 1 } })).resolves.toEqual({
        path: '/a.png',
      });
      expect(service.getMyAvatar).toHaveBeenCalledWith(1);
    });
  });

  describe('favorites', () => {
    it('should fetch favorites with default pagination', async () => {
      favStoriesService.getFavoriteStories.mockResolvedValue({ data: [] });

      await controller.getFavorites({ user: { id: 1 } });

      expect(favStoriesService.getFavoriteStories).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
      });
    });

    it('should clamp page and limit for favorites', async () => {
      favStoriesService.getFavoriteStories.mockResolvedValue({ data: [] });

      await controller.getFavorites({ user: { id: 1 } }, '0', '999');

      expect(favStoriesService.getFavoriteStories).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 50,
      });
    });

    it('should add a story to the favorites', async () => {
      const dto = { storyId: 12 };
      favStoriesService.addToFavorites.mockResolvedValue({ id: 12 });

      await expect(
        controller.addToFavorites({ user: { id: 1 } }, dto as any),
      ).resolves.toEqual({ id: 12 });
      expect(favStoriesService.addToFavorites).toHaveBeenCalledWith(1, 12);
    });

    it('should remove all favorites', async () => {
      await controller.removeAllFavorites({ user: { id: 1 } });

      expect(favStoriesService.removeAllFavoriteStories).toHaveBeenCalledWith(
        1,
      );
    });

    it('should remove a single favorite', async () => {
      await controller.removeFromFavorites({ user: { id: 1 } }, 12);

      expect(favStoriesService.removeFromFavorites).toHaveBeenCalledWith(1, 12);
    });
  });

  describe('favorite hubers', () => {
    it('should list favorite hubers', async () => {
      userFavoriteHuberService.getFavoriteHubers.mockResolvedValue({
        data: [],
      });

      await expect(
        controller.getFavHubers({ user: { id: 1 } }),
      ).resolves.toEqual({ data: [] });
    });

    it('should add a favorite huber', async () => {
      const dto = { huberId: 9 };
      userFavoriteHuberService.add.mockResolvedValue({ id: 9 });

      await controller.addToFavoriteHubers({ user: { id: 1 } }, dto as any);

      expect(userFavoriteHuberService.add).toHaveBeenCalledWith(1, 9);
    });

    it('should remove a favorite huber', async () => {
      await controller.removeFromFavHubers({ user: { id: 1 } }, '9');

      expect(userFavoriteHuberService.removeFavorite).toHaveBeenCalledWith(
        1,
        9,
      );
    });
  });

  describe('profile editing', () => {
    it('should add an education', async () => {
      const dto = { major: 'CS' };
      usersService.addEducation.mockResolvedValue({ id: 1 });

      await expect(
        controller.addEducation({ user: { id: 1 } }, dto as any),
      ).resolves.toEqual({ id: 1 });
      expect(usersService.addEducation).toHaveBeenCalledWith(1, dto);
    });

    it('should update topics of interest', async () => {
      const dto = { topics: [1, 2] };
      usersService.updateTopics.mockResolvedValue(undefined);

      await controller.updateTopics({ user: { id: 1 } }, dto as any);

      expect(usersService.updateTopics).toHaveBeenCalledWith(1, [1, 2]);
    });

    it('should add and update work entries', async () => {
      const addDto = { position: 'Dev' };
      usersService.addWork.mockResolvedValue({ id: 1 });

      await controller.addWork({ user: { id: 1 } }, addDto as any);
      expect(usersService.addWork).toHaveBeenCalledWith(1, addDto);

      const updateDto = { position: 'Senior' };
      usersService.updateWork.mockResolvedValue({ id: 1 });

      await controller.updateWork({ user: { id: 1 } }, '9', updateDto as any);
      expect(usersService.updateWork).toHaveBeenCalledWith(1, 9, updateDto);
    });

    it('should delete profile entries with parsed ids', async () => {
      await controller.deleteEducation({ user: { id: 1 } }, '9');

      expect(usersService.deleteEducation).toHaveBeenCalledWith(1, 9);

      await controller.deleteWork({ user: { id: 1 } }, '8');

      expect(usersService.deleteWork).toHaveBeenCalledWith(1, 8);
    });

    it('should mark the huber onboarding as seen', async () => {
      usersService.markHuberOnboardingSeen.mockResolvedValue({
        id: 1,
        hasSeenHuberOnboarding: true,
      });

      await expect(
        controller.markHuberOnboardingSeen({ user: { id: 1 } }),
      ).resolves.toEqual({ id: 1, hasSeenHuberOnboarding: true });
    });
  });

  describe('session management', () => {
    it('should refresh the token pair', async () => {
      service.refreshToken.mockResolvedValue({ token: 't' });

      await expect(
        controller.refresh({ user: { sessionId: 1, hash: 'h' } }),
      ).resolves.toEqual({ token: 't' });
      expect(service.refreshToken).toHaveBeenCalledWith({
        sessionId: 1,
        hash: 'h',
      });
    });

    it('should log out the session', async () => {
      service.logout.mockResolvedValue({ count: 1 });

      await controller.logout({ user: { sessionId: 1 } });

      expect(service.logout).toHaveBeenCalledWith({ sessionId: 1 });
    });

    it('should update the current profile', async () => {
      const payload = { id: 1, sessionId: 2 };
      const dto = { fullName: 'New' };
      service.update.mockResolvedValue({ id: 1 });

      await expect(
        controller.update({ user: payload }, dto as any),
      ).resolves.toEqual({ id: 1 });
      expect(service.update).toHaveBeenCalledWith(payload, dto);
    });

    it('should upgrade the account', async () => {
      service.upgradeAccout.mockResolvedValue({ message: 'ok' });

      await expect(
        controller.upgradeAccount({ user: { id: 1 } }),
      ).resolves.toEqual({ message: 'ok' });
      expect(service.upgradeAccout).toHaveBeenCalledWith(1);
    });

    it('should register as a human book', async () => {
      const dto = { fullName: 'New' };
      service.registerToHumanBook.mockResolvedValue({ id: 1 });

      await expect(
        controller.registerToHumanBooks({ user: { id: 1 } }, dto as any),
      ).resolves.toEqual({ id: 1 });
      expect(service.registerToHumanBook).toHaveBeenCalledWith(1, dto);
    });
  });
});
