import { StickersService } from './stickers.service';

describe('StickersService', () => {
  let service: StickersService;
  let repository: { create: jest.Mock; findAllWithPagination: jest.Mock };

  beforeEach(() => {
    repository = { create: jest.fn(), findAllWithPagination: jest.fn() };
    service = new StickersService(repository as never);
  });

  it('should delegate create to the repository', async () => {
    const dto = { name: 'Cool', image: { id: 1 } } as never;
    repository.create.mockResolvedValue('sticker');
    await expect(service.create(dto)).resolves.toBe('sticker');
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAllWithPagination with the given pagination options', async () => {
    repository.findAllWithPagination.mockResolvedValue([]);
    await expect(
      service.findAllWithPagination({
        paginationOptions: { page: 2, limit: 20 },
      }),
    ).resolves.toEqual([]);
    expect(repository.findAllWithPagination).toHaveBeenCalledWith({
      paginationOptions: { page: 2, limit: 20 },
    });
  });
});
