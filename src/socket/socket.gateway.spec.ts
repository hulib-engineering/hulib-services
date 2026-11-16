import { SocketGateway } from './socket.gateway';

describe('SocketGateway call-ended', () => {
  it('should reject a recipient outside the active reading session', async () => {
    const prisma = {
      readingSession: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const cache = { get: jest.fn() };
    const gateway = new SocketGateway(
      {} as never,
      cache as never,
      prisma as never,
    );
    await expect(
      gateway.handleCallEnded({ recipientId: '20' }, {
        session: { id: 10 },
      } as never),
    ).rejects.toThrow('Not an active call participant');
    expect(cache.get).not.toHaveBeenCalled();
  });
});
