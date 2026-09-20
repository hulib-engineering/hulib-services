import { StickersController } from './stickers.controller';

describe('StickersController', () => {
  let controller: StickersController;
  let service: { findAllWithPagination: jest.Mock };

  beforeEach(() => {
    service = { findAllWithPagination: jest.fn() };
    controller = new StickersController(service as never);
  });

  it('should paginate and cap the limit at 50', async () => {
    service.findAllWithPagination.mockResolvedValue([]);
    const result = await controller.findAll({ page: 1, limit: 100 } as never);
    expect(service.findAllWithPagination).toHaveBeenCalledWith({
      paginationOptions: { page: 1, limit: 50 },
    });
    expect(result).toHaveProperty('data', []);
    expect(result).toHaveProperty('hasNextPage');
  });

  it('should default to page 1 and limit 10', async () => {
    service.findAllWithPagination.mockResolvedValue([]);
    await controller.findAll({} as never);
    expect(service.findAllWithPagination).toHaveBeenCalledWith({
      paginationOptions: { page: 1, limit: 10 },
    });
  });
});
