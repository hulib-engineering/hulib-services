import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsRepository } from './topics.repository';
import { PermissionService } from '@permission/services/permission.service';
import { Topics } from './domain/topics';
import { TopicColor } from './topic-color.enum';
import { TopicStatus } from './topic-status.enum';
import { makeUser } from '@permission/permission.fixtures.spec-helpers';

describe('TopicsService', () => {
  let service: TopicsService;
  let repository: {
    create: jest.Mock;
    findAllWithPagination: jest.Mock;
    findTop3PopularTopics: jest.Mock;
    findById: jest.Mock;
    findByName: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    findByIds: jest.Mock;
  };
  let permissionService: {
    canManageTopics: jest.Mock;
    canReadTopic: jest.Mock;
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

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAllWithPagination: jest.fn(),
      findTop3PopularTopics: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByIds: jest.fn(),
    };
    permissionService = {
      canManageTopics: jest.fn(),
      canReadTopic: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        { provide: TopicsRepository, useValue: repository },
        { provide: PermissionService, useValue: permissionService },
      ],
    }).compile();

    service = moduleRef.get<TopicsService>(TopicsService);
  });

  describe('create', () => {
    it('should trim the name and apply defaults before saving', async () => {
      repository.findByName.mockResolvedValue(null);
      const expected = makeTopic({ id: 9, name: 'Hulib' });
      repository.create.mockResolvedValue(expected);

      const result = await service.create({
        name: '  Hulib  ',
      } as any);

      expect(repository.findByName).toHaveBeenCalledWith('Hulib');
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Hulib',
        color: TopicColor.primary,
        status: TopicStatus.inactive,
      });
      expect(result).toEqual(expected);
    });

    it('should preserve an explicit color and status', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeTopic());

      await service.create({
        name: 'Hulib',
        color: TopicColor.green,
        status: TopicStatus.active,
      });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Hulib',
        color: TopicColor.green,
        status: TopicStatus.active,
      });
    });

    it('should throw ConflictException when the name already exists', async () => {
      repository.findByName.mockResolvedValue(makeTopic());

      await expect(service.create({ name: 'Existing' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllWithPagination', () => {
    const paginationOptions = { page: 2, limit: 10 };

    it('should force status=active for anonymous callers', async () => {
      repository.findAllWithPagination.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAllWithPagination({ paginationOptions });

      expect(repository.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions,
        name: undefined,
        status: TopicStatus.active,
      });
    });

    it('should force status=active for authenticated non-managers', async () => {
      permissionService.canManageTopics.mockReturnValue(false);
      repository.findAllWithPagination.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAllWithPagination({
        paginationOptions,
        user: makeUser(),
      });

      expect(repository.findAllWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ status: TopicStatus.active }),
      );
    });

    it('should not filter by status for topic managers', async () => {
      permissionService.canManageTopics.mockReturnValue(true);
      repository.findAllWithPagination.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAllWithPagination({
        paginationOptions,
        user: makeUser(),
      });

      expect(repository.findAllWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ status: undefined }),
      );
    });

    it('should forward the name filter', async () => {
      repository.findAllWithPagination.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAllWithPagination({
        paginationOptions,
        name: 'Gia',
      });

      expect(repository.findAllWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Gia' }),
      );
    });

    it('should return the repository result', async () => {
      const data = [makeTopic()];
      repository.findAllWithPagination.mockResolvedValue({ data, total: 1 });

      const result = await service.findAllWithPagination({ paginationOptions });

      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findTop3Popular', () => {
    it('should delegate to the repository', async () => {
      const topics = [makeTopic(), makeTopic({ id: 2 })];
      repository.findTop3PopularTopics.mockResolvedValue(topics);

      await expect(service.findTop3Popular()).resolves.toEqual(topics);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when the topic does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(42, makeUser())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the user may not read the topic', async () => {
      repository.findById.mockResolvedValue(makeTopic());
      permissionService.canReadTopic.mockReturnValue(false);

      await expect(service.findOne(1, makeUser())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the topic when the user may read it', async () => {
      const topic = makeTopic();
      repository.findById.mockResolvedValue(topic);
      permissionService.canReadTopic.mockReturnValue(true);

      await expect(service.findOne(1, makeUser())).resolves.toEqual(topic);
      expect(permissionService.canReadTopic).toHaveBeenCalledWith(
        expect.anything(),
        topic,
      );
    });
  });

  describe('update', () => {
    it('should update without a duplicate check when the name is unchanged', async () => {
      repository.update.mockResolvedValue(makeTopic());

      const dto = { color: TopicColor.blue };
      await service.update(1, dto);

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should trim the name and check for duplicates excluding itself', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeTopic({ name: 'New' }));

      await service.update(1, { name: '  New  ' } as any);

      expect(repository.findByName).toHaveBeenCalledWith('New', 1);
      expect(repository.update).toHaveBeenCalledWith(1, { name: 'New' });
    });

    it('should throw ConflictException when another topic uses the name', async () => {
      repository.findByName.mockResolvedValue(makeTopic({ id: 7 }));

      await expect(service.update(1, { name: 'Taken' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delegate to the repository', async () => {
      repository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(1);
    });
  });
});
