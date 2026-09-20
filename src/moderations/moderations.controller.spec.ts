import { ModerationsController } from './moderations.controller';

describe('ModerationsController', () => {
  let controller: ModerationsController;
  let service: {
    findModerations: jest.Mock;
    banUser: jest.Mock;
    unbanUser: jest.Mock;
    warnUser: jest.Mock;
    unwarnUser: jest.Mock;
  };

  beforeEach(() => {
    service = {
      findModerations: jest.fn(),
      banUser: jest.fn(),
      unbanUser: jest.fn(),
      warnUser: jest.fn(),
      unwarnUser: jest.fn(),
    };
    controller = new ModerationsController(service as never);
  });

  it('should delegate getModerations to the service', () => {
    const query = { userId: 3, page: 1, limit: 10 };
    service.findModerations.mockReturnValue('moderations');
    expect(controller.getModerations(query)).toBe('moderations');
    expect(service.findModerations).toHaveBeenCalledWith(query);
  });

  it('should delegate banUser to the service', () => {
    service.banUser.mockReturnValue('ban');
    expect(controller.banUser({ userId: 3 })).toBe('ban');
    expect(service.banUser).toHaveBeenCalledWith({ userId: 3 });
  });

  it('should delegate unbanUser to the service', () => {
    service.unbanUser.mockReturnValue('unban');
    expect(controller.unbanUser({ userId: 3 })).toBe('unban');
    expect(service.unbanUser).toHaveBeenCalledWith({ userId: 3 });
  });

  it('should delegate warnUser to the service', () => {
    service.warnUser.mockReturnValue('warn');
    expect(controller.warnUser({ userId: 3 })).toBe('warn');
    expect(service.warnUser).toHaveBeenCalledWith({ userId: 3 });
  });

  it('should delegate unwarnUser to the service', () => {
    service.unwarnUser.mockReturnValue('unwarn');
    expect(controller.unwarnUser({ userId: 3 })).toBe('unwarn');
    expect(service.unwarnUser).toHaveBeenCalledWith({ userId: 3 });
  });
});
