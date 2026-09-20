import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { Topics } from './domain/topics';
import { TopicColor } from './topic-color.enum';
import { TopicStatus } from './topic-status.enum';
import { TopicQueryTypeEnum } from './topic-query-type.enum';
import { RoleEnum } from '@roles/roles.enum';
import { CaslAbilityFactory } from '@permission/ability.factory';
import {
  makeAbilityFactoryStub,
  FakeAbility,
  makeUser,
} from '@permission/permission.fixtures.spec-helpers';

describe('TopicsController', () => {
  let controller: TopicsController;
  let service: {
    create: jest.Mock;
    findAllWithPagination: jest.Mock;
    findTop3Popular: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const makeTopic = (overrides: Partial<Topics> = {}): Topics => ({
    id: 1,
    name: 'Gia đình',
    color: TopicColor.pink,
    status: TopicStatus.active,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  });

  const reader = makeUser({ role: { id: RoleEnum.reader } });
  const admin = makeUser({ role: { id: RoleEnum.admin } });

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAllWithPagination: jest.fn(),
      findTop3Popular: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [
        { provide: TopicsService, useValue: service },
        { provide: Reflector, useValue: new Reflector() },
        {
          provide: CaslAbilityFactory,
          useValue: makeAbilityFactoryStub(new FakeAbility()),
        },
      ],
    }).compile();

    controller = moduleRef.get<TopicsController>(TopicsController);
  });

  describe('findAll', () => {
    it('should return the top-3 popular topics when MOST_POPULAR is requested', async () => {
      const topics = [makeTopic(), makeTopic({ id: 2 }), makeTopic({ id: 3 })];
      service.findTop3Popular.mockResolvedValue(topics);

      const result = await controller.findAll({ user: reader }, {
        type: TopicQueryTypeEnum.MOST_POPULAR,
      } as any);

      expect(service.findTop3Popular).toHaveBeenCalled();
      expect(service.findAllWithPagination).not.toHaveBeenCalled();
      expect(result).toEqual({ data: topics, hasNextPage: true });
    });

    it('should default pagination to page 1 limit 10 for readers', async () => {
      service.findAllWithPagination.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll({ user: reader }, {} as any);

      expect(service.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 10 },
        name: undefined,
        user: reader,
      });
    });

    it('should forward the requested page, limit and name filter', async () => {
      service.findAllWithPagination.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll({ user: reader }, {
        page: 3,
        limit: 25,
        name: 'Gia',
      } as any);

      expect(service.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 3, limit: 25 },
        name: 'Gia',
        user: reader,
      });
    });

    it('should cap the limit at 50', async () => {
      service.findAllWithPagination.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll({ user: reader }, {
        page: 1,
        limit: 999,
      } as any);

      expect(service.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 50 },
        name: undefined,
        user: reader,
      });
    });

    it('should return infinity pagination for non-admin callers', async () => {
      const data = [makeTopic()];
      service.findAllWithPagination.mockResolvedValue({ data, total: 2 });

      const result = await controller.findAll({ user: reader }, {} as any);

      expect(result).toEqual({ data, hasNextPage: false });
    });

    it('should return offset pagination meta for admins', async () => {
      const data = [makeTopic()];
      service.findAllWithPagination.mockResolvedValue({ data, total: 10 });

      const result = await controller.findAll({ user: admin }, {
        page: 2,
        limit: 10,
      } as any);

      expect(result).toEqual({
        data,
        meta: {
          totalItems: 10,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 2,
        },
      });
    });
  });

  describe('create', () => {
    it('should delegate to the service', async () => {
      const dto = { name: 'Hulib', color: TopicColor.blue };
      service.create.mockResolvedValue(makeTopic({ name: 'Hulib' }));

      await expect(controller.create(dto)).resolves.toEqual(
        makeTopic({ name: 'Hulib' }),
      );
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should delegate with the id and request user', async () => {
      const topic = makeTopic();
      service.findOne.mockResolvedValue(topic);

      await expect(controller.findOne({ user: reader }, 5)).resolves.toEqual(
        topic,
      );
      expect(service.findOne).toHaveBeenCalledWith(5, reader);
    });
  });

  describe('update', () => {
    it('should delegate with the id and body', async () => {
      const body = { name: 'New' };
      service.update.mockResolvedValue(makeTopic({ name: 'New' }));

      await expect(controller.update(5, body)).resolves.toEqual(
        makeTopic({ name: 'New' }),
      );
      expect(service.update).toHaveBeenCalledWith(5, body);
    });
  });

  describe('deleteTopic', () => {
    it('should delegate with the parsed id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.deleteTopic(5);

      expect(service.remove).toHaveBeenCalledWith(5);
    });
  });
});
