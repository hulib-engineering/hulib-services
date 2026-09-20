import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { TimeSlotService } from './time-slots.service';
import { TimeSlotRepository } from './time-slot.repository';
import { RoleEnum } from '../roles/roles.enum';
import { Approval } from '../users/approval.enum';

describe('TimeSlotService', () => {
  let service: TimeSlotService;
  let repository: { [K in keyof TimeSlotRepository]: jest.Mock };
  let userService: { findById: jest.Mock };

  const makeUser = (overrides: Record<string, unknown> = {}) =>
    ({
      id: 5,
      role: { id: RoleEnum.humanBook },
      approval: Approval.approved,
      ...overrides,
    }) as never;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findByUser: jest.fn(),
      findByTime: jest.fn(),
      findByDayOfWeek: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      findAll: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    } as never;
    userService = { findById: jest.fn() };
    service = new TimeSlotService(repository as never, userService as never);
  });

  describe('create', () => {
    it('should throw NotFound when the user is missing or not a huber', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        service.create({ dayOfWeek: 1, startTime: '09:00' }, 5),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw Conflict when a conflicting slot already exists', async () => {
      userService.findById.mockResolvedValue(makeUser());
      repository.findByUser.mockResolvedValue([
        { id: 1, dayOfWeek: 1, startTime: '09:00' },
      ]);

      await expect(
        service.create({ dayOfWeek: 1, startTime: '09:00' }, 5),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should persist the time slot through the repository on success', async () => {
      userService.findById.mockResolvedValue(makeUser());
      repository.findByUser.mockResolvedValue([
        { id: 1, dayOfWeek: 2, startTime: '10:00' },
      ]);
      const slot = { id: 2, dayOfWeek: 1, startTime: '09:00', huberId: 5 };
      repository.create.mockResolvedValue(slot);

      await expect(
        service.create({ dayOfWeek: 1, startTime: '09:00' }, 5),
      ).resolves.toEqual(slot);
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    const dto = (timeSlots: { dayOfWeek: number; startTime: string }[]) => ({
      timeSlots,
    });

    it('should throw NotFound when the user is missing', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        service.createMany(dto([{ dayOfWeek: 1, startTime: '09:00' }]), 5),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw Forbidden for a reader without pending approval', async () => {
      userService.findById.mockResolvedValue(
        makeUser({
          role: { id: RoleEnum.reader },
          approval: Approval.approved,
        }),
      );

      await expect(
        service.createMany(dto([{ dayOfWeek: 1, startTime: '09:00' }]), 5),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should allow a reader with pending approval', async () => {
      userService.findById.mockResolvedValue(
        makeUser({ role: { id: RoleEnum.reader }, approval: Approval.pending }),
      );
      repository.findByUser.mockResolvedValue([]);
      repository.createMany.mockResolvedValue([]);

      await expect(
        service.createMany(dto([{ dayOfWeek: 1, startTime: '09:00' }]), 5),
      ).resolves.toEqual([]);
    });

    it('should throw Conflict on duplicate slots inside the request', async () => {
      userService.findById.mockResolvedValue(makeUser());

      await expect(
        service.createMany(
          dto([
            { dayOfWeek: 1, startTime: '09:00' },
            { dayOfWeek: 1, startTime: '09:00' },
          ]),
          5,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should throw Not Modified when the incoming slots match existing ones', async () => {
      userService.findById.mockResolvedValue(makeUser());
      repository.findByUser.mockResolvedValue([
        { id: 1, dayOfWeek: 1, startTime: '09:00' },
      ]);

      const promise = service.createMany(
        dto([{ dayOfWeek: 1, startTime: '09:00' }]),
        5,
      );

      await expect(promise).rejects.toBeInstanceOf(HttpException);
      await expect(promise).rejects.toMatchObject({
        status: HttpStatus.NOT_MODIFIED,
      });
    });

    it('should delegate to the repository on success', async () => {
      userService.findById.mockResolvedValue(makeUser());
      repository.findByUser.mockResolvedValue([
        { id: 1, dayOfWeek: 2, startTime: '10:00' },
      ]);
      repository.createMany.mockResolvedValue([
        { id: 2, dayOfWeek: 1, startTime: '09:00' },
      ]);

      await service.createMany(dto([{ dayOfWeek: 1, startTime: '09:00' }]), 5);

      expect(repository.createMany).toHaveBeenCalled();
    });
  });

  describe('findAll / findByHuber', () => {
    it('should throw NotFound when the user is not a huber in findAll', async () => {
      userService.findById.mockResolvedValue(
        makeUser({ role: { id: RoleEnum.reader } }),
      );

      await expect(service.findAll(5)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should return the huber time slots via findByUser in findAll', async () => {
      userService.findById.mockResolvedValue(makeUser());
      repository.findByUser.mockResolvedValue([{ id: 1 }]);

      await expect(service.findAll(5)).resolves.toEqual([{ id: 1 }]);
      expect(repository.findByUser).toHaveBeenCalledWith(5);
    });

    it('should throw NotFound when the user is not a huber in findByHuber', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(service.findByHuber(5)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should return the huber time slots via findByUser in findByHuber', async () => {
      userService.findById.mockResolvedValue(makeUser());
      repository.findByUser.mockResolvedValue([{ id: 2 }]);

      await expect(service.findByHuber(5)).resolves.toEqual([{ id: 2 }]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFound when the slot does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should return the slot when found', async () => {
      const slot = { id: 1, dayOfWeek: 1, startTime: '09:00' };
      repository.findById.mockResolvedValue(slot);

      await expect(service.findOne(1)).resolves.toEqual(slot);
    });
  });

  describe('remove', () => {
    it('should delegate to the repository remove', async () => {
      repository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should throw NotFound when the slot does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(1, { dayOfWeek: 1, startTime: '09:00' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw Conflict when another slot uses the target time', async () => {
      repository.findById.mockResolvedValue({ id: 1 });
      repository.findByTime.mockResolvedValue({ id: 2 });

      await expect(
        service.update(1, { dayOfWeek: 1, startTime: '09:00' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should persist the merged slot via update', async () => {
      repository.findById.mockResolvedValue({
        id: 1,
        dayOfWeek: 3,
        startTime: '11:00',
      });
      repository.findByTime.mockResolvedValue(null);
      const merged = { id: 1, dayOfWeek: 1, startTime: '09:00' };
      repository.update.mockResolvedValue(merged);

      await expect(
        service.update(1, { dayOfWeek: 1, startTime: '09:00' }),
      ).resolves.toEqual(merged);
    });
  });

  describe('findByDayOfWeek', () => {
    it('should delegate to the repository findByDayOfWeek', async () => {
      const rows = [{ id: 1, dayOfWeek: 1 }];
      repository.findByDayOfWeek.mockResolvedValue(rows);

      await expect(service.findByDayOfWeek(1)).resolves.toEqual(rows);
      expect(repository.findByDayOfWeek).toHaveBeenCalledWith(1);
    });
  });
});
