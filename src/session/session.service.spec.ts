import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';

describe('SessionService', () => {
  let service: SessionService;
  let repository: {
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    deleteById: jest.Mock;
    deleteByUserId: jest.Mock;
    deleteByUserIdWithExclude: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteByUserIdWithExclude: jest.fn(),
    };
    service = new SessionService(repository as unknown as SessionRepository);
  });

  it('should delegate findById', async () => {
    repository.findById.mockResolvedValue({ id: 1 });

    await expect(service.findById(1)).resolves.toEqual({ id: 1 });
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('should delegate create', async () => {
    const data = { user: { id: 1 }, hash: 'h' };
    repository.create.mockResolvedValue({ id: 2 });

    await expect(service.create(data as any)).resolves.toEqual({ id: 2 });
    expect(repository.create).toHaveBeenCalledWith(data);
  });

  it('should delegate update', async () => {
    repository.update.mockResolvedValue({ id: 1 });

    await service.update(1, { hash: 'h2' });

    expect(repository.update).toHaveBeenCalledWith(1, { hash: 'h2' });
  });

  it('should delegate deleteById', async () => {
    repository.deleteById.mockResolvedValue(undefined);

    await service.deleteById(3);

    expect(repository.deleteById).toHaveBeenCalledWith(3);
  });

  it('should delegate deleteByUserId', async () => {
    repository.deleteByUserId.mockResolvedValue(undefined);

    await service.deleteByUserId({ userId: 4 });

    expect(repository.deleteByUserId).toHaveBeenCalledWith({ userId: 4 });
  });

  it('should delegate deleteByUserIdWithExclude', async () => {
    repository.deleteByUserIdWithExclude.mockResolvedValue(undefined);

    await service.deleteByUserIdWithExclude({ userId: 4, excludeSessionId: 2 });

    expect(repository.deleteByUserIdWithExclude).toHaveBeenCalledWith({
      userId: 4,
      excludeSessionId: 2,
    });
  });
});
