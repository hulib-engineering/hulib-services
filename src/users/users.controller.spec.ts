import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ReadingSessionStatus } from '../reading-sessions/domain';
import { FilterUserDto } from './dto/query-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    create: jest.Mock;
    findManyWithPagination: jest.Mock;
    findById: jest.Mock;
    updateLanguage: jest.Mock;
    updateStatus: jest.Mock;
    remove: jest.Mock;
    upgrade: jest.Mock;
    getReadingSessions: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findManyWithPagination: jest.fn(),
      findById: jest.fn(),
      updateLanguage: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
      upgrade: jest.fn(),
      getReadingSessions: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = moduleRef.get<UsersController>(UsersController);
  });

  describe('create', () => {
    it('should delegate to the service', async () => {
      const dto = { email: 'a@b.com', fullName: 'A' };
      service.create.mockResolvedValue({ id: 1 });

      await expect(controller.create(dto as any)).resolves.toEqual({ id: 1 });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should default pagination and forward the role filter', async () => {
      service.findManyWithPagination.mockResolvedValue({ data: [], count: 0 });

      const result = await controller.findAll({
        role: 'reader',
      } as any);

      expect(service.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: { role: 'reader' },
        sortOptions: undefined,
        paginationOptions: { page: 1, limit: 10 },
      });
      expect(result).toEqual({
        data: [],
        meta: {
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      });
    });

    it('should cap the limit at 50', async () => {
      service.findManyWithPagination.mockResolvedValue({ data: [], count: 0 });

      await controller.findAll({ page: 3, limit: 999 } as any);

      expect(service.findManyWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          paginationOptions: { page: 3, limit: 50 },
        }),
      );
    });

    it('should forward the sort options', async () => {
      service.findManyWithPagination.mockResolvedValue({ data: [], count: 0 });

      const sort = [{ orderBy: 'fullName', order: 'asc' } as FilterUserDto];
      await controller.findAll({ sort } as any);

      expect(service.findManyWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ sortOptions: sort }),
      );
    });
  });

  describe('findOne', () => {
    it('should delegate with the id', async () => {
      service.findById.mockResolvedValue({ id: 5 });

      await expect(controller.findOne(5)).resolves.toEqual({ id: 5 });
      expect(service.findById).toHaveBeenCalledWith(5);
    });
  });

  describe('updateLanguage', () => {
    it('should delegate with the request user id', async () => {
      service.updateLanguage.mockResolvedValue({ id: 1, languageCode: 'vi' });

      await expect(
        controller.updateLanguage({ user: { id: 7 } }, {
          language: 'vi',
        } as any),
      ).resolves.toEqual({ id: 1, languageCode: 'vi' });
      expect(service.updateLanguage).toHaveBeenCalledWith(7, 'vi');
    });
  });

  describe('update', () => {
    it('should delegate the status update', async () => {
      service.updateStatus.mockResolvedValue({ id: 1 });

      await controller.update(1, { status: 'inactive' } as any);

      expect(service.updateStatus).toHaveBeenCalledWith(1, 'inactive');
    });
  });

  describe('remove', () => {
    it('should delegate with the id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('upgrade', () => {
    it('should delegate with the id and body', async () => {
      const dto = { action: 'accept' };
      service.upgrade.mockResolvedValue({ message: 'ok' });

      await expect(controller.upgrade(1, dto as any)).resolves.toEqual({
        message: 'ok',
      });
      expect(service.upgrade).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('getReadingSessions', () => {
    it('should forward the status and default pagination', async () => {
      service.getReadingSessions.mockResolvedValue({ data: [], meta: {} });

      await controller.getReadingSessions(3, {
        sessionStatus: ReadingSessionStatus.APPROVED,
      } as any);

      expect(service.getReadingSessions).toHaveBeenCalledWith({
        userId: 3,
        status: ReadingSessionStatus.APPROVED,
        paginationOptions: { page: 1, limit: 10 },
      });
    });

    it('should cap the limit at 50', async () => {
      service.getReadingSessions.mockResolvedValue({ data: [], meta: {} });

      await controller.getReadingSessions(3, {
        sessionStatus: ReadingSessionStatus.FINISHED,
        limit: 999,
      } as any);

      expect(service.getReadingSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          paginationOptions: { page: 1, limit: 50 },
        }),
      );
    });
  });
});
