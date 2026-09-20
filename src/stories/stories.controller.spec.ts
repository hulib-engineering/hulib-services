import { BadRequestException } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { PublishStatus } from './status.enum';
import { RoleEnum } from '@roles/roles.enum';

describe('StoriesController', () => {
  let controller: StoriesController;
  let service: {
    create: jest.Mock;
    createFirst: jest.Mock;
    findAllWithCountAndPagination: jest.Mock;
    getContestParticipants: jest.Mock;
    findOne: jest.Mock;
    share: jest.Mock;
    like: jest.Mock;
    getTopics: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let storyReviewService: { getReviewsOverview: jest.Mock };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      createFirst: jest.fn(),
      findAllWithCountAndPagination: jest.fn(),
      getContestParticipants: jest.fn(),
      findOne: jest.fn(),
      share: jest.fn(),
      like: jest.fn(),
      getTopics: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    storyReviewService = { getReviewsOverview: jest.fn() };
    controller = new StoriesController(
      service as never,
      storyReviewService as never,
    );
  });

  it('should route reader creation to createFirst', () => {
    const request = { user: { id: 3, role: { id: RoleEnum.reader } } };
    const dto = { title: 'X' } as never;
    service.createFirst.mockReturnValue('first');
    expect(controller.create(request, dto)).toBe('first');
    expect(service.createFirst).toHaveBeenCalledWith(3, dto);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('should route non-reader creation to create', () => {
    const request = { user: { id: 2, role: { id: RoleEnum.humanBook } } };
    const dto = { title: 'X' } as never;
    service.create.mockReturnValue('story');
    expect(controller.create(request, dto)).toBe('story');
    expect(service.create).toHaveBeenCalledWith(2, dto);
  });

  it('should delegate findOne for an authenticated user', async () => {
    service.findOne.mockResolvedValue({ id: 1 });
    await expect(
      controller.findOne(1, { user: { id: 5 }, ip: '1.2.3.4' } as never),
    ).resolves.toEqual({ id: 1 });
    expect(service.findOne).toHaveBeenCalledWith(1, true, 'user:5');
  });

  it('should delegate getContestParticipants with the default topic', async () => {
    service.getContestParticipants.mockResolvedValue([]);
    await expect(controller.getContestParticipants()).resolves.toEqual([]);
    expect(service.getContestParticipants).toHaveBeenCalledWith(
      'Khoảnh khắc',
      undefined,
      undefined,
    );
  });

  it('should parse page and limit query params for contest participants', async () => {
    service.getContestParticipants.mockResolvedValue([]);
    await controller.getContestParticipants('topic', '2', '10');
    expect(service.getContestParticipants).toHaveBeenCalledWith('topic', 2, 10);
  });

  it('should delegate a path-based share', () => {
    service.share.mockReturnValue('shared');
    expect(controller.share(1, { user: { id: 5 } } as never)).toBe('shared');
    expect(service.share).toHaveBeenCalledWith(1, 5);
  });

  it('should delegate a body-based share', () => {
    service.share.mockReturnValue('shared');
    expect(
      controller.shareByBody({ storyId: 3 }, { user: { id: 5 } } as never),
    ).toBe('shared');
    expect(service.share).toHaveBeenCalledWith(3, 5);
  });

  it('should throw BadRequest for a body-based share without a story id', () => {
    expect(() =>
      controller.shareByBody({}, { user: { id: 5 } } as never),
    ).toThrow(BadRequestException);
  });

  it('should delegate findRelatedTopics', () => {
    service.getTopics.mockReturnValue([]);
    expect(controller.findRelatedTopics(1)).toEqual([]);
    expect(service.getTopics).toHaveBeenCalledWith(1);
  });

  it('should delegate update with the caller role', () => {
    service.update.mockReturnValue('updated');
    expect(
      controller.update(
        1,
        { title: 'X' } as never,
        { user: { id: 5, role: { id: RoleEnum.reader } } } as never,
      ),
    ).toBe('updated');
    expect(service.update).toHaveBeenCalledWith(
      1,
      { title: 'X' },
      {
        id: 5,
        roleId: RoleEnum.reader,
      },
    );
  });

  it('should delegate remove', () => {
    service.remove.mockReturnValue('removed');
    expect(controller.remove(1)).toBe('removed');
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should delegate the reviews overview', () => {
    storyReviewService.getReviewsOverview.mockReturnValue('overview');
    expect(controller.getReviewsOverview(1)).toBe('overview');
    expect(storyReviewService.getReviewsOverview).toHaveBeenCalledWith(1);
  });

  it('should return a publishStatus-preserving feed through findAll', async () => {
    service.findAllWithCountAndPagination.mockResolvedValue({
      data: [],
      count: 0,
    });
    const result = await controller.findAll(
      { user: { id: 5 } } as never,
      { publishStatus: PublishStatus.pending } as never,
    );
    expect(result).toHaveProperty('data');
    expect(service.findAllWithCountAndPagination).toHaveBeenCalled();
  });
});
