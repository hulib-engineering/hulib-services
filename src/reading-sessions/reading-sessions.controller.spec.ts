import { ReadingSessionsController } from './reading-sessions.controller';

describe('ReadingSessionsController', () => {
  let controller: ReadingSessionsController;
  let service: {
    createSession: jest.Mock;
    findAllSessions: jest.Mock;
    findUpcomingSessions: jest.Mock;
    findOneSession: jest.Mock;
    updateSession: jest.Mock;
    deleteSession: jest.Mock;
  };

  beforeEach(() => {
    service = {
      createSession: jest.fn(),
      findAllSessions: jest.fn(),
      findUpcomingSessions: jest.fn(),
      findOneSession: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn(),
    };
    controller = new ReadingSessionsController(service as never);
  });

  it('should delegate create to the service', async () => {
    const dto = { humanBookId: 10, readerId: 20 } as never;
    service.createSession.mockResolvedValue('session');
    await expect(controller.create(dto)).resolves.toBe('session');
    expect(service.createSession).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAllSessions with the authenticated user id', async () => {
    service.findAllSessions.mockResolvedValue([]);
    await expect(
      controller.findAllSessions({} as never, { user: { id: 5 } } as never),
    ).resolves.toEqual([]);
    expect(service.findAllSessions).toHaveBeenCalledWith({}, 5);
  });

  it('should delegate findUpcomingSessions with the query and authenticated user id', async () => {
    const query = { withinHours: 24, limit: 5 };
    const result = {
      data: [],
      meta: { count: 0, serverTime: '2026-11-01T13:46:00.000Z' },
    };
    service.findUpcomingSessions.mockResolvedValue(result);

    await expect(
      controller.findUpcomingSessions(query, { user: { id: 5 } } as never),
    ).resolves.toBe(result);
    expect(service.findUpcomingSessions).toHaveBeenCalledWith(query, 5);
  });

  it('should delegate findOneSession and strip scalar id fields', async () => {
    service.findOneSession.mockResolvedValue({
      id: 1,
      humanBookId: 10,
      readerId: 20,
      storyId: 30,
      title: 'T',
    });
    const result = await controller.findOneSession(1);
    expect(result).toEqual({ id: 1, title: 'T' });
  });

  it('should delegate updateSession', async () => {
    service.updateSession.mockResolvedValue('updated');
    await expect(controller.updateSession(1, {} as never)).resolves.toBe(
      'updated',
    );
    expect(service.updateSession).toHaveBeenCalledWith(1, {});
  });

  it('should delegate deleteSession', async () => {
    service.deleteSession.mockResolvedValue(undefined);
    await expect(controller.deleteSession(1)).resolves.toBeUndefined();
    expect(service.deleteSession).toHaveBeenCalledWith(1);
  });
});
